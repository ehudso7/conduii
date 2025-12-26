const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

const PRO_PLAN = {
  name: "Pro",
  description: "For professional developers",
  amount: 2900, // $29.00
  currency: "usd",
};

async function main() {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY is required');
    process.exit(1);
  }

  console.log('Searching for existing Pro product...');
  
  // List products to find "Pro"
  // Using search might be better but list is simpler for small number of products
  const products = await stripe.products.list({
    active: true,
    limit: 100,
  });

  let product = products.data.find(p => p.name === PRO_PLAN.name);

  if (product) {
    console.log(`Found existing product: ${product.name} (${product.id})`);
  } else {
    console.log('Creating Pro product...');
    product = await stripe.products.create({
      name: PRO_PLAN.name,
      description: PRO_PLAN.description,
    });
    console.log(`Created product: ${product.id}`);
  }

  // Check for price
  const prices = await stripe.prices.list({
    product: product.id,
    active: true,
    limit: 100,
  });

  let price = prices.data.find(p => 
    p.unit_amount === PRO_PLAN.amount && 
    p.currency === PRO_PLAN.currency &&
    p.recurring?.interval === 'month'
  );

  if (price) {
    console.log(`Found existing price: ${price.id}`);
  } else {
    console.log('Creating Pro price...');
    price = await stripe.prices.create({
      product: product.id,
      unit_amount: PRO_PLAN.amount,
      currency: PRO_PLAN.currency,
      recurring: {
        interval: 'month',
      },
    });
    console.log(`Created price: ${price.id}`);
  }

  console.log('\nSUCCESS! Add this to your .env file:');
  console.log(`STRIPE_PRO_PRICE_ID=${price.id}`);
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
