const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  // find all products
  // be sure to include its associated Category and Tag data
  try {
    const allProducts = await Product.findAll({
      include: [{ model: Tag, through: ProductTag, as: 'tags' }, {model: Category}]
    })
    res.status(200).json(allProducts);
  } catch (error) {
    res.status(400).json(error);
  }
});

// get one product
router.get('/:id', async (req, res) => {
  // find a single product by its `id`
  // be sure to include its associated Category and Tag data
  try {
    const allProducts = await Product.findByPk(req.params.id, {
      include: [{ model: Tag, through: ProductTag, as: 'tags' }, {model: Category}]
    });
    res.status(200).json(allProducts)
  } catch (error) {
    res.status(500).json(error)
  };
});

// create new product
router.post('/', (req, res) => {

// What the hell is happening here? 
  Product.create(req.body)
    .then((product) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds && req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      // if no product tags, just respond
      res.status(200).json(product);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// update product
// update product GOOD 
router.put('/:id', (req, res) => {
  // update product data 
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then(async () => {
      // check if array of products tagIds were sent
      if (req.body.tagIds && req.body.tagIds.length) {
        // Find all of the tags for the product
        const productTags = await ProductTag.findAll({
          where: { product_id: req.params.id }
        });
        // transform the product tag data
        const productTagIds = productTags.map(({ tag_id }) => tag_id);

        /* When updating product tags, the array sent over may contain new tag_ids 
           and it may also be void of tag_ids that used to be there.
           We have to account for both situations:  */

        // create filtered list of new tag_ids
        const newProductTags = req.body.tagIds
          // filter where the tag_ids coming over are not already in the current tag list
          .filter((tag_id) => !productTagIds.includes(tag_id))
          .map((tag_id) => {
            return {
              product_id: req.params.id,
              tag_id,
            };
          });
        // figure out which ones to remove
        const productTagsToRemove = productTags
          // filter where the current tag list has tags that are not present in the new tag list coming over
          .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
          .map(({ id }) => id);
        // run both actions asynchronously
        Promise.all([
          ProductTag.destroy({ where: { id: productTagsToRemove } }),
          ProductTag.bulkCreate(newProductTags),
        ]);
        return res.json("Successfully updated with updated product tags")
      }
      return res.json("Successfully updated (no product tags included)");
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});
router.delete('/:id', async (req, res) => {
  // delete one product by its `id` value
  try {
    const deleteProduct = await Product.destroy({
      where: {
        id: req.params.id
      }
    })
    if (!deleteProduct) {
      res.status(404).json({message: 'no Product found with this id!'});
      return;
    }
    res.status(200).json(deleteProduct);
  } catch (error) {
  res.status(500).json(error);
  }
  });

module.exports = router;
