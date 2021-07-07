import remark from "remark";
import html from "remark-html";
import fs from "fs";
import { join, parse } from "path";
import matter from "gray-matter";
import toml from "@iarna/toml";

const directories = {
  blog: join(process.cwd(), "content/blog"),
  events: join(process.cwd(), "content/events"),
  docs: join(process.cwd(), "content/docs"),
  grants: join(process.cwd(), "content/grants"),
  media: join(process.cwd(), "content/media"),
};

export function getPostSlugs(key) {
  return fs.readdirSync(directories[key]);
}

// NB Gavin: This could be much simpler if we converted everything to a more common standard, like YAML
const options = {
  engines: {
    toml: toml.parse.bind(toml),
  },
  language: "toml",
  delimiters: "+++",
};

export function getPostBySlug(slug, fields = [], key) {
  const realSlug = slug.replace(/\.md$/, "");
  const fullPath = join(directories[key], `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents, options);
  const items = {};

  // Ensure only the minimal needed data is exposed
  fields.forEach((field) => {
    if (field === "slug") {
      items[field] = realSlug;
    }

    if (field === "content") {
      items[field] = content;
    }

    if (data[field]) {
      items[field] = data[field];
    }
  });

  // NB Gavin: This could be removed if the TOML engine returned a JSON date (string) instead of a JS Date object. The YAML engine did this parsing by default.
  items.date = JSON.stringify(items.date).replace(/\"/g, "");

  return items;
}

export function getAllPosts(fields = [], key) {
  const slugs = getPostSlugs(key);
  const posts = slugs
    .map((slug) => getPostBySlug(slug, fields, key))
    // sort posts by date in descending order
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));

  return posts;
}

function getAllPaths(dirPath, arrayOfFiles) {
  let files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function (file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllPaths(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(join(dirPath, "/", file));
    }
  });

  return arrayOfFiles;
}

export function getDocsPaths() {
  return getAllPaths(directories.docs, []);
}

export function getNextPost(slug, fields = [], key) {
  let resultPost = null;

  getAllPosts(fields, key).forEach((post, index, array) => {
    if (post.slug === slug) {
      resultPost = array[index - 1];
    }
  });
  return resultPost;
}

export function getPreviousPost(slug, fields = [], key) {
  let resultPost = null;

  getAllPosts(fields, key).forEach((post, index, array) => {
    if (post.slug === slug) {
      resultPost = array[index + 1];
    }
  });
  return resultPost;
}

export function formatDate(d) {
  // const wk = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const mn = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return mn[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
}

// export function capitalize(str) {
//   return str.charAt(0).toUpperCase() + str.slice(1);
// }

// export function generateCrumbs(path) {
//   const crumbs = path.split('/')
//   return crumbs
// 	.filter(v => v !== '')
// 	.map((crumb, index) => ({
// 	  name: capitalize(crumb),
// 	  key: crumb,
// 	  path: crumbs.slice(0, index+2).join('/'),
//   }))
// }

/**
 * buildPageTree is written to provide a recursive index of posts
 * for nested directories for creating sidebars
 * @param {string} path Absolute path to the subdirectory.
 * @returns {Object.<string,string|Object<string,string[]|number>>} Title of the directory, child pages, and child directories (recursive structure).
 *
 */

// type PageTree =
//   { title: string,
//     pages: [{
//       title: string,
//       base: string,
//       slug: string,
//       weight: number,
//     }],
//     children: { [string]: PageTree },
//   }

export function buildPageTree(path, ordering = "", content = false) {
  const metadata = matter(fs.readFileSync(join(path, "_index.md")), options);
  // get a list of contents at the path, with file types so that the item at the path can be identified as file or folder
  const children = fs.readdirSync(path, { withFileTypes: true });
  // get a list of files
  const pages = children.filter((f) => f.isFile() && f.name !== "_index.md");
  // get a list of folders
  const subdirs = children.filter((f) => f.isDirectory());
  // return a pagetree datastructure
  return {
    title: metadata.data.title,
    pages: pages
      .map((page) => {
        // retrieve topmatter as JSON
        const { content, data } = matter(
          fs.readFileSync(join(path, page.name)),
          options
        );

        return {
          title: data.title,
          base: page.name,
          slug: page.name.replace(/.md$/, ""),
          ...(ordering === "weight" && { weight: data?.weight ?? 0 }),
          ...(ordering === "date" && {
            date: data?.date ?? "2000-01-01T00:00:00.000Z",
          }),
        };
      })
      .sort((a, b) => a.weight - b.weight),
    children: Object.fromEntries(
      subdirs.map((subdir) => [
        subdir.name,
        buildPageTree(join(path, subdir.name), ordering, content),
      ])
    ),
  };
}

export const getPage = (path) => {
  try {
    let fileContents = fs.readFileSync(`${path}.md`, "utf8");
    if (fileContents) {
      const { data, content } = matter(fileContents, options);
      return { data, content };
    }
  } catch {
    try {
      let fileContents = fs.readFileSync(`${path}/_index.md`, "utf8");
      if (fileContents) {
        const { data, content } = matter(fileContents, options);
        return { data, content };
      }
    } catch {
      console.error("no md file for slug");
    }
  }
};

// Returns an array of unique grants categories
export function getGrantsCategories() {
  const paths = fs.readdirSync(directories.grants);
  const uniqueCategories = paths
    // Get only markdown files
    .filter((path) => parse(path).ext === ".md")
    // Parse frontmatter
    .map((path) =>
      matter(fs.readFileSync(join(directories.grants, path)), options)
    )
    // Each markdown file has an array of categories. Collapse these arrays into one array.
    .reduce((acc, metadata) => {
      return [...acc, ...metadata.data.taxonomies.grant_category];
    }, [])
    // Deduplicate single array of categories such that the output is an array where each category is represented only once.
    .reduce((acc, uniqueItem) => {
      if (acc.includes(uniqueItem)) {
        return acc;
      }
      return [...acc, uniqueItem];
    }, []);
  return uniqueCategories;
}

// Returns an array of unique grants types
export function getGrantsTypes() {
  const paths = fs.readdirSync(directories.grants);
  const uniqueTypes = paths
    // Get only markdown files
    .filter((path) => parse(path).ext === ".md")
    // Parse frontmatter to JSON
    .map((path) =>
      matter(fs.readFileSync(join(directories.grants, path)), options)
    )
    // Each markdown file has an array of types. Collapse these arrays into one array.
    .reduce((acc, metadata) => {
      return [...acc, ...metadata.data.taxonomies.grant_type];
    }, [])
    // Deduplicate single array of types such that the output is an array where each type is represented only once.
    .reduce((acc, uniqueItem) => {
      if (acc.includes(uniqueItem)) {
        return acc;
      }
      return [...acc, uniqueItem];
    }, []);
  return uniqueTypes;
}

// Returns a number which represents how many grants are open, or uncompleted
export function getOpenGrantsCount() {
  const paths = fs.readdirSync(directories.grants);
  const count = paths
    // Get only markdown files
    .filter((path) => parse(path).ext === ".md")
    // Parse frontmatter to JSON
    .map((path) =>
      matter(fs.readFileSync(join(directories.grants, path)), options)
    )
    // Count grants which are both uncompleted and not assigned
    .reduce((acc, metadata) => {
      if (
        !metadata.data.extra.completed &&
        metadata.data.extra.assignee === ""
      ) {
        return acc + 1;
      }
      return acc;
    }, 0);
  return count;
}