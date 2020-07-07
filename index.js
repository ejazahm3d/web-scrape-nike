const puppeteer = require("puppeteer");
const fs = require("fs");
const { v4 } = require("uuid");

const BASE_URL = "https://www.nike.com/w/mens-shoes-nik1zy7ok";

(async () => {
  const browser = await puppeteer.launch({ devtools: true });
  const page = await browser.newPage();
  await page.goto(BASE_URL, {
    waitUntil: "domcontentloaded",
  });

  const productLinks = await page.evaluate(async () => {
    const productNodeLinks = Array.from(
      document.querySelectorAll(".product-card__link-overlay")
    ).map((product) => product.href);
    return productNodeLinks;
  });

  let finalProducts = [];
  for (productPage of productLinks) {
    await page.goto(productPage, { waitUntil: "domcontentloaded" });
    const currentProduct = await page.evaluate(async () => {
      const name = document.querySelector("[data-test=product-title]")
        .textContent;
      const price = document.querySelectorAll("[data-test=product-price]")[0]
        .textContent;
      const category = document.querySelector("[data-test=product-sub-title]")
        .textContent;

      const description = document.querySelector(".description-preview")
        .innerHTML;

      let images = [];
      const imageNodes = document.querySelectorAll("picture > img");

      for (let img of imageNodes) {
        if (
          img &&
          img.src &&
          !img.src.includes("PDP_LOADING") &&
          img.src.includes("static")
        )
          images.push(img.src);
      }

      return {
        name,
        price,
        category,
        description,
        images,
      };
    });

    finalProducts.push(currentProduct);
    await page.goBack({ waitUntil: "domcontentloaded" });
  }
  finalProducts = await finalProducts.map((product) => ({
    id: v4(),
    ...product,
  }));

  await browser.close();
  await fs.writeFileSync(
    "products.json",
    JSON.stringify(finalProducts),
    (err) => {
      console.log("Hello > asdad");
    }
  );
})();
