const puppeteer = require("puppeteer");
const fs = require("fs/promises")(async () => {
  const browser = await puppeteer.launch({ devtools: true, headless: false });
  const page = await browser.newPage();
  await page.goto("https://www.nike.com/w/mens-shoes-nik1zy7ok", {
    waitUntil: "domcontentloaded",
  });

  const productLinks = await page.evaluate(async () => {
    const productNodeLinks = Array.from(
      document.querySelectorAll(".product-card__link-overlay")
    ).map((product) => product.href);
    return productNodeLinks;
  });

  const finalProducts = [];
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
  console.log(finalProducts);

  await browser.close();
})();
