import { Hono } from 'hono';
import { cors } from 'hono/cors';

export type Env = {
  DB: D1Database;
  GEMINI_API_KEY: string;
};

const app = new Hono<{ Bindings: Env }>();

// Enable CORS for frontend
app.use('/api/*', cors());

app.get('/', (c) => {
  return c.text('Lyric Pad API is running!');
});

// Projects
app.get('/api/projects', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM projects ORDER BY updated_at DESC'
  ).all();
  return c.json(results);
});

app.post('/api/projects', async (c) => {
  const { title } = await c.req.json();
  const id = crypto.randomUUID();
  await c.env.DB.prepare(
    'INSERT INTO projects (id, title) VALUES (?, ?)'
  ).bind(id, title).run();
  
  return c.json({ id, title, audioUrl: null }, 201);
});

app.get('/api/projects/:id', async (c) => {
  const id = c.req.param('id');
  const project = await c.env.DB.prepare(
    'SELECT * FROM projects WHERE id = ?'
  ).bind(id).first();

  if (!project) {
    return c.notFound();
  }

  const { results: blocks } = await c.env.DB.prepare(
    'SELECT * FROM blocks WHERE project_id = ? ORDER BY sequence ASC'
  ).bind(id).all();

  return c.json({ ...project, blocks });
});

app.put('/api/projects/:id', async (c) => {
  const id = c.req.param('id');
  const { title, audioUrl } = await c.req.json();

  await c.env.DB.prepare(
    'UPDATE projects SET title = ?, audio_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  ).bind(title, audioUrl, id).run();

  return c.json({ success: true });
});

// Blocks
app.put('/api/projects/:id/blocks', async (c) => {
  const projectId = c.req.param('id');
  const body = await c.req.json();
  const blocks: Array<{ id: string; type: string; content: string; sequence: number }> = body.blocks || [];

  // simplest autosave mechanism: delete all and re-enter, or use a batch of upserts
  // We'll delete and re-insert in a batch
  const stmts = [];
  stmts.push(
    c.env.DB.prepare('DELETE FROM blocks WHERE project_id = ?').bind(projectId)
  );

  for (const block of blocks) {
    const blockId = block.id || crypto.randomUUID();
    stmts.push(
      c.env.DB.prepare(
        'INSERT INTO blocks (id, project_id, type, content, sequence) VALUES (?, ?, ?, ?, ?)'
      ).bind(blockId, projectId, block.type, block.content, block.sequence)
    );
  }

  // Update project updated_at timestamp
  stmts.push(
    c.env.DB.prepare('UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(projectId)
  );

  await c.env.DB.batch(stmts);

  return c.json({ success: true });
});

export default app;
