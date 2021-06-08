require("babel-register")({
  presets: ["es2015", "react"],
});
const fetch = require("fetch").fetchUrl;

const router = require("./sitemap-routes").default;
const Sitemap = require("react-router-sitemap").default;

const generateSitemap = async () => {
  fetch(
    "https://rustjobsserver.herokuapp.com/jobs/public",
    (error, meta, body) => {
      return new Sitemap(router(body.toString()))
        .build("https://www.rustjobs.dev")
        .save("./public/sitemap.xml");
    }
  );
};

generateSitemap();
