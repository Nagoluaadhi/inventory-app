import express from 'express';
const router = express.Router();
import db from '../db.js';

// Get all clients
router.get('/', async (req, res) => {
  try {
    const [clients] = await db.execute('SELECT * FROM clients');
    res.json(clients);
  } catch (err) {
    console.error('❌ SQL Error in /api/clients:', err);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

router.post('/', async (req, res) => {
  const { client_name, address, branch_user_id } = req.body;
  if (!client_name) return res.status(400).json({ error: 'Client name is required' });

  try {
    await db.execute(
  'INSERT INTO clients (client_name, address, branch_user_id) VALUES (?, ?, ?)',
  [client_name, address || '', branch_user_id || null]
);
    res.json({ message: 'Client added' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add Client' });
  }
});
// DELETE a client
router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  const force = req.query.force === 'true';

  try {
    const [used] = await db.execute('SELECT id FROM stock_transactions WHERE client_id = ? LIMIT 1', [id]);

    if (used.length > 0 && !force) {
      return res.status(400).json({ error: 'Cannot delete client. It is used in transactions.' });
    }

    if (force) {
      await db.execute('DELETE FROM stock_transactions WHERE client_id = ?', [id]);
      await db.execute('DELETE FROM services WHERE client_id = ?', [id]);
      await db.execute('DELETE FROM user_usage WHERE client_id = ?', [id]);
    }

    await db.execute('DELETE FROM clients WHERE id = ?', [id]);
    res.json({ message: 'Client deleted' });

  } catch (err) {
    res.status(500).json({ error: 'Delete failed', detail: err.message });
  }
});

export default router;
