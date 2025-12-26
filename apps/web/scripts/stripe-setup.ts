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
    process.exit(1);
  }
}

setupStripe();
