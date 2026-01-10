import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  ApolloLink,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

// Use relative URL for production (goes through Vercel rewrites)
// Use VITE_GRAPHQL_ENDPOINT for local development
const graphqlEndpoint =
  import.meta.env.VITE_GRAPHQL_ENDPOINT ||
  (import.meta.env.DEV ? "http://localhost:8000/graphql" : "/graphql");

const httpLink = createHttpLink({
  uri: graphqlEndpoint,
});

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = localStorage.getItem("firebaseToken");
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
