const path = require(`path`)
const { createFilePath } = require('gatsby-source-filesystem')

exports.createPages = async ({ actions, graphql, reporter }) => {
  const { createPage } = actions

  const result = await graphql(`
    {
      allMarkdownRemark(
        sort: { order: DESC, fields: [frontmatter___date] }
        limit: 1000
      ) {
        edges {
          node {
            id
            fields {
              slug
            }
            frontmatter {
              template
            }
          }
        }
      }
    }
  `)

  // Handle errors
  if (result.errors) {
    reporter.panicOnBuild(`Error while running GraphQL query.`)
    return
  }

  // Filter out the content that we don't want pages created for
  const postOrPage = result.data.allMarkdownRemark.edges
    .filter(edge => edge.node.frontmatter.template !== "announcement");

  postOrPage.forEach(({ node }) => {
    debugger;
    const templateName = node.frontmatter.template || `default`
    const template = path.resolve(path.join('src/templates/', `${templateName}.js`))
    createPage({
      path: node.fields.slug,
      component: template,
      context: { id: node.id }, // additional data can be passed via context
    })
  })
}

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions

  if (node.internal.type === `MarkdownRemark`) {
    const value = createFilePath({ node, getNode })
    createNodeField({
      name: `slug`,
      node,
      value,
    })
  }
}
