const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

router.get('/', async (req, res) => {
  // find all categories
  // be sure to include its associated Products
try {
  const allCategories = await Category.findAll({
    include: [{model: Product}],
  });
  
  res.status(200).json(allCategories);
} catch (error) {
  res.status(500).json(error, 'no category found');
}
});

router.get('/:id', async (req, res) => {
  // find one category by its `id` value
  // be sure to include its associated Products
try {
  const allCategories = await Category.findByPk(req.params.id, {
    include: [{model: Product}],
  })
  res.status(200).json(allCategories);
} catch (error) {
  res.status(500).json(error);
}
  
});

router.post('/', async (req, res) => {
  // create a new category
  try {
    const newCategory = await Category.create(req.body);
    res.status(200).json(newCategory);
  } catch (error) {
    res.status(400).json('Category not created');
  }
});

router.put('/:id', async (req, res) => {
  // update a category by its `id` value
try {
  const allCategories = await Category.update (req.body,{
    where: {
      id: req.params.id
    }
  })
  res.status(200).json(allCategories);
} catch (error) {
 res.status(400).json("category not updated") 
}
});

router.delete('/:id', async (req, res) => {
  // delete a category by its `id` value
try {
  const deleteCategory = await Category.destroy({
    where: {
      id: req.params.id
    }
  })
  if (!deleteCategory) {
    res.status(404).json('no category found with this id!');
    return;
  }
  res.status(200).json(deleteCategory);
} catch (error) {
res.status(500).json(error);
}
});

module.exports = router;
