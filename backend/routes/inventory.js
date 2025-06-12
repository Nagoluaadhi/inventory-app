
const express = require('express');
const router = express.Router(); // ✅ this was missing
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM inventory');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// POST new inventory item
router.post('/', async (req, res) => {
  const { item_name, remark } = req.body;
  if (!item_name) return res.status(400).json({ error: 'Item name is required' });

  try {
    await db.execute('INSERT INTO inventory (item_name, remark) VALUES (?, ?)', [item_name, remark || '']);
    res.json({ message: 'Item added' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add item' });
  }
});

// DELETE an inventory item
router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  const force = req.query.force === 'true';

  try {
    const [used] = await db.execute('SELECT id FROM stock_transactions WHERE inventory_id = ? LIMIT 1', [id]);

    if (used.length > 0 && !force) {
      return res.status(400).json({ error: 'Cannot delete item. It is used in transactions.' });
    }

    if (force) {
      await db.execute('DELETE FROM stock_transactions WHERE inventory_id = ?', [id]);
      await db.execute('DELETE FROM user_usage WHERE inventory_id = ?', [id]);
    }

    await db.execute('DELETE FROM inventory WHERE id = ?', [id]);
    res.json({ message: 'Item deleted' });

  } catch (err) {
    res.status(500).json({ error: 'Delete failed', detail: err.message });
  }
});


module.exports = router;

