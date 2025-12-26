import Stripe from "stripe";

async function setupStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    console.error("❌ STRIPE_SECRET_KEY environment variable is not set");
    process.exit(1);
  }

  console.log("🔧 Setting up Stripe...\n");

  try {
    const stripe = new Stripe(secretKey, {
      apiVersion: "2023-10-16",
      typescript: true,
    });

    // Validate the key by retrieving account information
    const account = await stripe.accounts.retrieve();
    
    console.log("✅ Stripe key is valid!\n");
    console.log("📋 Account Information:");
    console.log(`   Account ID: ${account.id}`);
    console.log(`   Business Type: ${account.business_type || "N/A"}`);
    console.log(`   Country: ${account.country || "N/A"}`);
    console.log(`   Default Currency: ${account.default_currency || "N/A"}`);
    console.log(`   Charges Enabled: ${account.charges_enabled ? "Yes" : "No"}`);
    console.log(`   Payouts Enabled: ${account.payouts_enabled ? "Yes" : "No"}\n`);

    // List products
    const products = await stripe.products.list({ limit: 10 });
    console.log(`📦 Products (${products.data.length}):`);
    if (products.data.length === 0) {
      console.log("   No products found");
    } else {
      for (const product of products.data) {
        console.log(`   - ${product.name} (${product.id})`);
      }
    }

    // List prices
    const prices = await stripe.prices.list({ limit: 10 });
    console.log(`\n💰 Prices (${prices.data.length}):`);
    if (prices.data.length === 0) {
      console.log("   No prices found");
    } else {
      for (const price of prices.data) {
        const amount = price.unit_amount
          ? `$${(price.unit_amount / 100).toFixed(2)}`
          : "Custom";
        const interval = price.recurring?.interval || "one-time";
        console.log(
          `   - ${price.id}: ${amount} ${interval} (${price.currency.toUpperCase()})`
        );
      }
    }

    console.log("\n✅ Stripe setup complete!");
  } catch (error: any) {
    console.error("❌ Error setting up Stripe:");
    if (error.type === "StripeAuthenticationError") {
      console.error("   Invalid API key. Please check your STRIPE_SECRET_KEY.");
    } else {
      console.error(`   ${error.message}`);
    }
#!/usr/bin/env node
import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  console.error("❌ Error: STRIPE_SECRET_KEY environment variable is required");
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
  typescript: true,
});

async function setupStripe() {
  console.log("🔧 Setting up Stripe products and prices...\n");

  try {
    // Check if we can connect to Stripe
    const account = await stripe.accounts.retrieve();
    console.log(`✅ Connected to Stripe account: ${account.email || account.id}`);
    console.log(`   Mode: ${STRIPE_SECRET_KEY.startsWith('sk_live_') ? 'LIVE' : 'TEST'}\n`);

    // Create or retrieve Conduii product
    let product: Stripe.Product;
    const products = await stripe.products.list({ limit: 100 });
    const existingProduct = products.data.find(p => p.name === "Conduii Pro");

    if (existingProduct) {
      product = existingProduct;
      console.log(`✅ Found existing product: ${product.name} (${product.id})`);
    } else {
      product = await stripe.products.create({
        name: "Conduii Pro",
        description: "Professional plan for Conduii - AI-powered testing platform",
      });
      console.log(`✅ Created product: ${product.name} (${product.id})`);
    }

    // Create or retrieve monthly price
    const prices = await stripe.prices.list({ 
      product: product.id,
      active: true,
    });
    
    let monthlyPrice = prices.data.find(
      p => p.recurring?.interval === 'month' && p.unit_amount === 2900
    );
    
    if (!monthlyPrice) {
      monthlyPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: 2900, // $29.00
        currency: "usd",
        recurring: {
          interval: "month",
        },
        nickname: "Pro Monthly",
      });
      console.log(`✅ Created monthly price: ${monthlyPrice.id} ($29/month)`);
    } else {
      console.log(`✅ Found existing monthly price: ${monthlyPrice.id} ($29/month)`);
    }

    // Create or retrieve yearly price
    let yearlyPrice = prices.data.find(
      p => p.recurring?.interval === 'year' && p.unit_amount === 29000
    );
    
    if (!yearlyPrice) {
      yearlyPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: 29000, // $290.00 (save ~17%)
        currency: "usd",
        recurring: {
          interval: "year",
        },
        nickname: "Pro Yearly",
      });
      console.log(`✅ Created yearly price: ${yearlyPrice.id} ($290/year)`);
    } else {
      console.log(`✅ Found existing yearly price: ${yearlyPrice.id} ($290/year)`);
    }

    console.log("\n✅ Stripe setup complete!\n");
    console.log("📝 Add these to your .env.local file:\n");
    console.log(`STRIPE_SECRET_KEY="${STRIPE_SECRET_KEY}"`);
    console.log(`STRIPE_PRO_MONTHLY_PRICE_ID="${monthlyPrice.id}"`);
    console.log(`STRIPE_PRO_YEARLY_PRICE_ID="${yearlyPrice.id}"`);
    
    if (STRIPE_SECRET_KEY.startsWith('sk_live_')) {
      console.log(`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."`);
    } else {
      console.log(`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."`);
    }
    
    console.log("\n⚠️  Note: You'll also need to set up your webhook endpoint in Stripe dashboard");
    console.log("   and add STRIPE_WEBHOOK_SECRET to your environment variables.");

  } catch (error: any) {
    console.error("\n❌ Error setting up Stripe:");
    console.error(error.message);
    process.exit(1);
  }
}

setupStripe();
