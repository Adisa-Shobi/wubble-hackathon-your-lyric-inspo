import { Hono } from 'hono';
import type { Env } from '../index.js';

const projects = new Hono<{ Bindings: Env }>();

const VALID_BLOCK_TYPES = [
  'verse',
  'chorus',
  'refrain',
  'pre-chorus',
  'bridge',
  'intro',
  'outro',
  'hook',
  'interlude'
] as const;

type BlockType = typeof VALID_BLOCK_TYPES[number];

projects.get('/', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM projects ORDER BY updated_at DESC'
  ).all();
  return c.json(results);
});

projects.post('/', async (c) => {
  const { title, wubbleProjectId } = await c.req.json();
  const id = crypto.randomUUID();
  await c.env.DB.prepare(
    'INSERT INTO projects (id, title, wubble_project_id) VALUES (?, ?, ?)'
  ).bind(id, title, wubbleProjectId || null).run();
  
  return c.json({ id, title, audioUrl: null, wubble_project_id: wubbleProjectId || null }, 201);
});

projects.get('/:id', async (c) => {
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

projects.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();

  const updates = [];
  const bindings: any[] = [];

  if (body.title !== undefined) {
    updates.push('title = ?');
    bindings.push(body.title);
  }
  if (body.audioUrl !== undefined) {
    updates.push('audio_url = ?');
    bindings.push(body.audioUrl);
  }
  if (body.wubbleProjectId !== undefined) {
    updates.push('wubble_project_id = ?');
    bindings.push(body.wubbleProjectId);
  }

  if (updates.length > 0) {
    updates.push('updated_at = CURRENT_TIMESTAMP');
    const query = `UPDATE projects SET ${updates.join(', ')} WHERE id = ?`;
    bindings.push(id);
    await c.env.DB.prepare(query).bind(...bindings).run();
  }

  return c.json({ success: true });
});

projects.delete('/:id', async (c) => {
  const id = c.req.param('id');

  await c.env.DB.batch([
    c.env.DB.prepare('DELETE FROM blocks WHERE project_id = ?').bind(id),
    c.env.DB.prepare('DELETE FROM projects WHERE id = ?').bind(id)
  ]);
  
  return c.json({ success: true });
});

projects.put('/:id/blocks', async (c) => {
  const projectId = c.req.param('id');
  const body = await c.req.json();
  const blocks: Array<{ id?: string; type: string; content: string; sequence: number }> = body.blocks || [];

  for (const block of blocks) {
    if (!VALID_BLOCK_TYPES.includes(block.type as BlockType)) {
      return c.json({ error: `Invalid block type: ${block.type}` }, 400);
    }
  }

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

  stmts.push(
    c.env.DB.prepare('UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(projectId)
  );

  await c.env.DB.batch(stmts);

  return c.json({ success: true });
});

export default projects;
