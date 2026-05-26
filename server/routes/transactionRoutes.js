const express = require('express');
const multer = require('multer');
const {
  getTransactions, createTransaction, updateTransaction,
  deleteTransaction, importCSV, exportCSV,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.use(protect);

router.get('/',       getTransactions);
router.get('/export', exportCSV);
router.post('/',      createTransaction);
router.post('/import', upload.single('file'), importCSV);
router.put('/:id',    updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;
