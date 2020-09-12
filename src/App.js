import React, { useEffect, useState } from 'react';
import './App.css';

import CreatePost from './pages/CreatePost/CreatePost';

import {
  Nav,
  Navbar,
  Collapse,
  List,
  Card,
  Button,
  BDiv,
  Modal,
  Form,
} from 'bootstrap-4-react';
import axios from 'axios';

function login(data) {
  axios
    .post('http://localhost/php_test_rest/api/users/login.php', data)
    .then(({ data }) => {
      localStorage.setItem('token', data.jwt);
      localStorage.setItem('userId', data.id);
      localStorage.setItem('expireAt', data.expireAt);
      localStorage.setItem('username', data.name);
      alert(data.message);
      window.location.reload();
    })
    .catch((err) => {
      if (err.response.status === 401) {
        alert('Password or email is wrong!');
      }
    });
}

function App() {
  const [posts, setPosts] = useState([]);
  const [isSignup, setIsSignup] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [page, setPage] = useState('home');
  const [chosenPost, setChosenPost] = useState({});
  const [wasUpdate, setWasUpdate] = useState(true);

  //Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (localStorage.getItem('token')) {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (wasUpdate) {
      axios
        .get('http://localhost/php_test_rest/api/posts/read.php')
        .then(({ data }) => {
          console.log(data);
          setPosts(data);
          setWasUpdate(false);
        })
        .catch((err) => {
          console.log(err);
          if (err.response.status === 404) {
            alert('No posts found! Please, login and create one!');
            setWasUpdate(false);
          }
        });
    }
  }, [wasUpdate]);

  const submitHandler = (event) => {
    event.preventDefault();
    let data;
    if (isSignup) {
      data = {
        name,
        email,
        password,
      };
      axios
        .post('http://localhost/php_test_rest/api/users/create.php', data)
        .then((result) => {
          alert(result.data.message);
          data = {
            email,
            password,
          };
          login(data);
        })
        .catch((err) => alert(err));
    } else {
      //Login here
      data = {
        email,
        password,
      };
      login(data);
    }
  };

  const logoutHandler = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('expireAt');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    window.location.reload();
  };

  const openFullPostHandler = (post) => {
    setChosenPost(post);
    setPage('post');
  };

  return (
    <BDiv display="flex" flex="column" alignItems="center">
      <Navbar expand="md" dark bg="dark" style={{ width: '100%' }}>
        <Navbar.Brand href="#">Do Your Post</Navbar.Brand>
        <Navbar.Toggler target="#navbarNav" />
        <Collapse navbar id="navbarNav">
          <Navbar.Nav>
            <Nav.ItemLink href="/">Home</Nav.ItemLink>
            {isLoggedIn ? (
              <Nav.ItemLink onClick={() => setPage('post')}>
                Create Post
              </Nav.ItemLink>
            ) : null}
            <Nav.ItemLink>
              {!isLoggedIn ? (
                <Button
                  light
                  sm
                  data-toggle="modal"
                  data-target="#exampleModal"
                >
                  Login/Signup
                </Button>
              ) : (
                <Button danger sm type="input" onClick={logoutHandler}>
                  Logout
                </Button>
              )}
            </Nav.ItemLink>
          </Navbar.Nav>
        </Collapse>
      </Navbar>
      <Modal id="exampleModal" fade>
        <Modal.Dialog centered>
          <Modal.Content>
            <Modal.Header>
              <Modal.Title>{isSignup ? 'SignUp' : 'Login'}</Modal.Title>
              <Modal.Close>
                <span aria-hidden="true">&times;</span>
              </Modal.Close>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={submitHandler}>
                {isSignup ? (
                  <Form.Group>
                    <label htmlFor="name">Name</label>
                    <Form.Input
                      type="text"
                      id="name"
                      placeholder="Enter your username"
                      onChange={(event) => setName(event.target.value)}
                      value={name}
                    />
                  </Form.Group>
                ) : null}
                <Form.Group>
                  <label htmlFor="email">Email address</label>
                  <Form.Input
                    type="email"
                    id="email"
                    placeholder="Enter email"
                    onChange={(event) => setEmail(event.target.value)}
                    value={email}
                  />
                  <Form.Text text="muted">
                    We'll never share your email with anyone else.
                  </Form.Text>
                </Form.Group>
                <Form.Group>
                  <label htmlFor="password">Password</label>
                  <Form.Input
                    type="password"
                    id="password"
                    placeholder="Type in your password"
                    onChange={(event) => setPassword(event.target.value)}
                    value={password}
                  />
                </Form.Group>
                <Button info type="submit">
                  Submit
                </Button>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button secondary data-dismiss="modal">
                Close
              </Button>
              <Button
                dark
                as="input"
                type="button"
                onClick={() => setIsSignup((prevState) => !prevState)}
                value={isSignup ? 'Swtich To Login' : 'Switch To Signup'}
              />
            </Modal.Footer>
          </Modal.Content>
        </Modal.Dialog>
      </Modal>
      {page === 'home' ? (
        <List
          unstyled
          display="flex"
          flex="row"
          w="100"
          flex="wrap"
          justifyContent="center"
        >
          {posts.length > 0 ? (
            posts.map((post) => (
              <List.Item key={post.id} m="3" style={{ width: '20rem' }}>
                <Card w="100">
                  <Card.Body
                    display="flex"
                    flex="column"
                    alignItems="center"
                    w="100"
                  >
                    <Card.Title>{post.title}</Card.Title>
                    <Card.Text>{post.description}</Card.Text>
                    <Button
                      dark
                      type="input"
                      onClick={() => openFullPostHandler(post)}
                    >
                      View Full
                    </Button>
                  </Card.Body>
                  <Card.Footer>Written by: {post.author}</Card.Footer>
                </Card>
              </List.Item>
            ))
          ) : (
            <h1>No Posts Found!</h1>
          )}
        </List>
      ) : (
        <CreatePost
          switchPage={(page) => {
            setPage(page);
            setChosenPost({});
          }}
          chosenPost={chosenPost}
          postUpdated={() => setWasUpdate(true)}
        />
      )}
    </BDiv>
  );
}

export default App;
