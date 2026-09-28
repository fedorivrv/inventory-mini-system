const express = require('express');
const cors = require('cors');

const productsRouter = require('./routes/products');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/products', productsRouter);

app.get('/', (req, res) => {
    res.json({status: "ok"});
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});