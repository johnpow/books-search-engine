import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
  defaultDataIdFromObject,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

import SearchBooks from './pages/SearchBooks';
import SavedBooks from './pages/SavedBooks';
import Navbar from './components/Navbar';

const httpLink = createHttpLink({
  uri: '/graphql',
});
const cache = new InMemoryCache({
  typePolicies: {
    User: {
      fields: {
        savedBooks: {
          merge(existing = [], incoming) {
            return incoming;
          },
        },
      },
    },
  },
  dataIdFromObject: (object) => {
    switch (object.__typename) {
      case 'User':
        return object._id; // Assuming the _id field is unique for each User
      default:
        return defaultDataIdFromObject(object);
    }
  },
});


const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = localStorage.getItem('id_token');
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: cache,
});

function App() {
  return (
    <ApolloProvider client={client}>
    <Router>
      <>
        <Navbar />
        <Routes>
          <Route exact 
            path='/' 
            element={<SearchBooks />} />
          <Route exact path='/saved' 
            element={< SavedBooks />} />
          <Route render={() => <h1 className='display-2'>Wrong page!</h1>} />
        </Routes>
      </>
    </Router>
    </ApolloProvider>
  );
}

export default App;
