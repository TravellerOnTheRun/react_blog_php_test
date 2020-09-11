import React, { useState, useEffect, useCallback } from 'react';

import { Form, Button, BDiv, Blockquote, List } from 'bootstrap-4-react';
import axios from 'axios';

export default (props) => {
  const [isForm, setIsForm] = useState(true);
  const [isUpdate, setIsUpdate] = useState(false);

  //Post form
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [description, setDescription] = useState('');

  //Comment field
  const [commentBody, setCommentBody] = useState();

  const [comments, setComments] = useState([]);

  useEffect(() => {
    if (props.chosenPost.id) {
      setIsForm(false);
      axios
        .get(
          `http://localhost/php_test_rest/api/comments/read.php?postId=${props.chosenPost.id}`
        )
        .then((result) => {
          setComments(result.data);
        })
        .catch((err) => {
          console.log('No comments found!');
        });
    }
  }, [props.chosenPost.id]);

  const resetFields = useCallback((data) => {
    alert(data.message);
    setTitle('');
    setBody('');
    setDescription('');
  }, []);

  const setFormToUpdate = () => {
    const { title, body, description } = props.chosenPost;

    setTitle(title);
    setBody(body);
    setDescription(description);
    setIsForm(true);
    setIsUpdate(true);
  };

  const submitHandler = (event) => {
    event.preventDefault();
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const userId = localStorage.getItem('userId');
    const data = {
      title,
      body,
      description,
      author: username,
      user_id: userId,
    };

    if (isUpdate) {
      data.id = props.chosenPost.id;

      axios
        .put(
          `http://localhost/php_test_rest/api/posts/update.php?token=${token}`,
          data
        )
        .then((result) => {
          console.dir(result);
          alert(result.data.message);
          resetFields(data);
          props.postUpdated();
          props.switchPage('home');
        })
        .catch((err) => {
          console.dir(err);
          alert(err.response.data.error);
        });
    } else {
      axios
        .post(
          `http://localhost/php_test_rest/api/posts/create.php?token=${token}`,
          data
        )
        .then(({ data }) => {
          alert(data.message);
          resetFields(data);
          props.switchPage('home');
        })
        .catch((err) => alert(err));
    }
  };

  const submitCommentHandler = (event) => {
    event.preventDefault();
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');

    const data = {
      body: commentBody,
      post_id: props.chosenPost.id,
      user_id: userId,
      username,
    };
    axios
      .post(
        `http://localhost/php_test_rest/api/comments/create.php?token=${token}`,
        data
      )
      .then((result) => {
        alert(result.data.message);
        setCommentBody('');
        setComments((prevState) => {
          const newCommentsArray = [data, ...prevState];
          return newCommentsArray;
        });
      })
      .catch((err) => {
        console.dir(err);
      });
  };

  let component = (
    <Form onSubmit={submitHandler} w="50" m="5">
      <Form.Group>
        <label htmlFor="title">Title</label>
        <Form.Input
          type="text"
          id="title"
          placeholder="Enter title of the post"
          onChange={(event) => setTitle(event.target.value)}
          value={title}
        />
      </Form.Group>
      <Form.Group>
        <label htmlFor="body">Body</label>
        <Form.Textarea
          id="body"
          rows="5"
          onChange={(event) => setBody(event.target.value)}
          value={body}
        ></Form.Textarea>
      </Form.Group>
      <Form.Group>
        <label htmlFor="desc">Description</label>
        <Form.Input
          type="text"
          id="desc"
          placeholder="Describe what post is about"
          onChange={(event) => setDescription(event.target.value)}
          value={description}
        />
      </Form.Group>
      <Button info type="submit">
        Submit
      </Button>
    </Form>
  );

  if (!isForm) {
    const { title, body, author } = props.chosenPost;
    component = (
      <BDiv w="100" display="flex" flex="column" alignItems="center">
        <BDiv w="50" display="flex" flex="column" alignItems="center" mb="5">
          <BDiv
            w="100"
            display="flex"
            alignItems="center"
            justifyContent="between"
          >
            <Button
              dark
              type="input"
              onClick={() => props.switchPage('home')}
              mt="2"
              alignSelf="start"
            >
              Go Back
            </Button>
            {props.chosenPost.user_id === localStorage.getItem('userId') ? (
              <Button dark type="input" mt="2" onClick={setFormToUpdate}>
                Edit Post
              </Button>
            ) : null}
          </BDiv>
          <h1>{title}</h1>
          <Blockquote>
            <p>{body}</p>
            <Blockquote.Footer>
              Created by <cite title="Source Title">{author}</cite>
            </Blockquote.Footer>
          </Blockquote>
          <Form w="100" display="flex" flex="column" alignItems="center">
            <Form.Textarea
              mb="2"
              onChange={(event) => setCommentBody(event.target.value)}
              value={commentBody}
            ></Form.Textarea>
            {localStorage.getItem('token') ? (
              <Button dark type="submit" onClick={submitCommentHandler}>
                Comment
              </Button>
            ) : null}
          </Form>
        </BDiv>
        <List unstyled w="50">
          {comments.map((comment) => (
            <List.Item key={comment.id}>
              <Blockquote>
                <p>{comment.body}</p>
                <Blockquote.Footer>
                  <cite title="Source Title">{comment.username}</cite>
                </Blockquote.Footer>
              </Blockquote>
            </List.Item>
          ))}
        </List>
      </BDiv>
    );
  }

  return component;
};
