// Simple GraphQL Example - Keurope Products
// Run with: node graphql-example.js

const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLFloat, GraphQLID, GraphQLList, graphql } = require('graphql');

// Sample data
const products = [
  { id: '1', name: 'Oversized Linen Blazer', price: 189, category: 'Outerwear' },
  { id: '2', name: 'Minimalist Cotton Shirt', price: 79, category: 'Tops' },
  { id: '3', name: 'Wide Leg Tailored Trousers', price: 129, category: 'Bottoms' },
];

// Define Product type
const ProductType = new GraphQLObjectType({
  name: 'Product',
  fields: {
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    price: { type: GraphQLFloat },
    category: { type: GraphQLString },
  },
});

// Define Query type (read operations)
const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    // Get all products
    products: {
      type: new GraphQLList(ProductType),
      resolve: () => products,
    },
    // Get single product by ID
    product: {
      type: ProductType,
      args: {
        id: { type: GraphQLID },
      },
      resolve: (_, args) => products.find(p => p.id === args.id),
    },
  },
});

// Create schema
const schema = new GraphQLSchema({
  query: QueryType,
});

// Example queries
const exampleQueries = [
  // Query 1: Get all products (names and prices only)
  `
    query {
      products {
        name
        price
      }
    }
  `,
  // Query 2: Get specific product by ID
  `
    query {
      product(id: "1") {
        name
        category
        price
      }
    }
  `,
];

// Run queries
console.log('=== GraphQL Example: Keurope Products ===\n');

exampleQueries.forEach((query, index) => {
  console.log(`Query ${index + 1}:`);
  console.log(query);
  graphql({ schema, source: query }).then(result => {
    console.log('Result:', JSON.stringify(result.data, null, 2));
    console.log('\n---\n');
  });
});
