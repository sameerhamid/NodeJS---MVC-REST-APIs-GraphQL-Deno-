import React, { Component, Fragment } from "react";

import Post from "../../components/Feed/Post/Post";
import Button from "../../components/Button/Button";
import FeedEdit from "../../components/Feed/FeedEdit/FeedEdit";
import Input from "../../components/Form/Input/Input";
import Paginator from "../../components/Paginator/Paginator";
import Loader from "../../components/Loader/Loader";
import ErrorHandler from "../../components/ErrorHandler/ErrorHandler";
import "./Feed.css";
import post from "../../components/Feed/Post/Post";

class Feed extends Component {
  state = {
    isEditing: false,
    posts: [],
    totalPosts: 0,
    editPost: null,
    status: "",
    postPage: 1,
    postsLoading: true,
    editLoading: false,
  };

  componentDidMount() {
    fetch("http://localhost:8080/graphql", {
      headers: {
        Authorization: "Bearer " + this.props.token,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        query: `
        {
          user {
            status
          }
        }
        `,
      }),
    })
      .then((res) => {
        return res.json();
      })
      .then((resData) => {
        if (resData.errors) {
          throw new Error("User status fetching failed!");
        }
        this.setState({ status: resData.data.user.status });
      })
      .catch(this.catchError);

    this.loadPosts();
  }

  loadPosts = (direction) => {
    if (direction) {
      this.setState({ postsLoading: true, posts: [] });
    }
    let page = this.state.postPage;
    if (direction === "next") {
      page++;
      this.setState({ postPage: page });
    }
    if (direction === "previous") {
      page--;
      this.setState({ postPage: page });
    }

    console.log(page);
    const graphqlQuery = {
      query: `
       query FetchPosts($page: Int!) {
  posts(page:$page) {
    posts {
      _id
      title
      content
      imageUrl
      creator{
        _id
        email
        name
      }
      createdAt
      updatedAt
    }
    totalPosts
  }
}
      `,
      variables: {
        page: page,
      },
    };

    fetch("http://localhost:8080/graphql", {
      method: "POST",
      body: JSON.stringify(graphqlQuery),
      headers: {
        Authorization: "Bearer " + this.props.token,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        return res.json();
      })
      .then((resData) => {
        if (resData.errors) {
          throw new Error("Posts fetching failed!");
        }
        this.setState({
          posts: resData.data.posts.posts.map((post) => ({
            ...post,
            imagePath: post.imageUrl,
          })),
          totalPosts: resData.data.posts.totalPosts,
          postsLoading: false,
        });
      })
      .catch(this.catchError);
  };

  statusUpdateHandler = (event) => {
    event.preventDefault();

    console.log(this.state.status);
    fetch("http://localhost:8080/graphql", {
      method: "POST",
      body: JSON.stringify({
        query: `mutation UpdateUserStatus($status:String!){
          updateStatus(status:$status){
            status
          }
        }`,
        variables: {
          status: this.state.status,
        },
      }),
      headers: {
        Authorization: "Bearer " + this.props.token,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        return res.json();
      })
      .then((resData) => {
        if (resData.errors) {
          throw new Error("Posts fetching failed!");
        }
        console.log(resData);
      })
      .catch(this.catchError);
  };

  newPostHandler = () => {
    this.setState({ isEditing: true });
  };

  startEditPostHandler = (postId) => {
    this.setState((prevState) => {
      const loadedPost = { ...prevState.posts.find((p) => p._id === postId) };

      return {
        isEditing: true,
        editPost: loadedPost,
      };
    });
  };

  cancelEditHandler = () => {
    this.setState({ isEditing: false, editPost: null });
  };

  // finishEditHandler = (postData) => {
  //   this.setState({
  //     editLoading: true,
  //   });

  //   const formData = new FormData();
  //   formData.append("title", postData.title);
  //   formData.append("content", postData.content);
  //   formData.append("image", postData.image);

  //   console.log("formData>>>", formData, postData);

  //   let url = "http://localhost:8080/feed/post";
  //   let method = "POST";
  //   if (this.state.editPost) {
  //     url = `http://localhost:8080/feed/post/${this.state.editPost._id}`;
  //     method = "PUT";
  //   }

  //   fetch(url, {
  //     method: method,
  //     body: formData,
  //     headers: {
  //       Authorization: "Bearer " + this.props.token,
  //     },
  //   })
  //     .then((res) => {
  //       if (res.status !== 200 && res.status !== 201) {
  //         throw new Error("Creating or editing a post failed!");
  //       }
  //       return res.json();
  //     })
  //     .then((resData) => {
  //       console.log(resData);
  //       const post = {
  //         _id: resData.post._id,
  //         title: resData.post.title,
  //         content: resData.post.content,
  //         creator: resData.post.creator,
  //         createdAt: resData.post.createdAt,
  //       };
  //       this.setState((prevState) => {
  //         return {
  //           isEditing: false,
  //           editPost: null,
  //           editLoading: false,
  //         };
  //       });
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //       this.setState({
  //         isEditing: false,
  //         editPost: null,
  //         editLoading: false,
  //         error: err,
  //       });
  //     });
  // };

  finishEditHandler = (postData) => {
    this.setState({
      editLoading: true,
    });

    const formData = new FormData();
    formData.append("image", postData.image);
    if (this.state.editPost) {
      formData.append("oldPath", this.state.editPost.imagePath);
    }

    console.log("formData>>>", formData);
    fetch("http://localhost:8080/post-image", {
      method: "PUT",
      headers: {
        Authorization: "Bearer " + this.props.token,
      },
      body: formData,
    })
      .then((res) => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Creating or editing a post failed!");
        }
        return res.json();
      })
      .then((resData) => {
        const imageUrl = resData.filePath || "undefined";
        let graphqlQuery = `
      mutation {
        createPost(postInput:{
          title:"${postData.title}",
          content:"${postData.content}",
          imageUrl:"${imageUrl}"
        }) {
          _id
          title
          content
          imageUrl
          creator {
            name
          }
      
        }
      }
      `;

        if (this.state.editPost) {
          graphqlQuery = `
          mutation {
  updatePost(
    id: "${this.state.editPost._id}"
    postInput: { title: "${postData.title}", content: "${postData.content}", imageUrl: "${imageUrl}" }
  ) {
    _id
    title
    content
    imageUrl
    creator {
      name
    }
    createdAt
    updatedAt
  }
}
          `;
        }

        return fetch("http://localhost:8080/graphql", {
          method: "POST",
          body: JSON.stringify({ query: graphqlQuery }),
          headers: {
            Authorization: "Bearer " + this.props.token,
            "Content-Type": "application/json",
          },
        });
      })
      .then((res) => {
        return res.json();
      })
      .then((resData) => {
        if (
          resData.errors &&
          resData.errors.length > 0 &&
          resData.errors[0].status === 422
        ) {
          throw new Error(
            "Validation failed. Make sure the email address isn't used yet!"
          );
        }

        if (resData.errors) {
          throw new Error("Post validation failed!");
        }
        console.log(resData);
        let resDataField = "createPost";
        if (this.state.editPost) {
          resDataField = "updatePost";
        }
        const post = {
          _id: resData.data[resDataField]._id,
          title: resData.data[resDataField].title,
          content: resData.data[resDataField].content,
          imagePath: resData.data[resDataField].imageUrl,
          creator: resData.data[resDataField].creator,
          createdAt: resData.data[resDataField].createdAt,
        };
        this.setState((prevState) => {
          let updatedTotalPost = prevState.totalPosts;
          const updatedPosts = [...prevState.posts];
          if (prevState.editPost) {
            const postIndex = prevState.posts.findIndex(
              (p) => p._id === prevState.editPost._id
            );
            updatedPosts[postIndex] = post;
          } else {
            updatedTotalPost++;
            if (prevState.posts.length >= 2) {
              updatedPosts.pop();
            }

            updatedPosts.unshift(post);
          }
          return {
            posts: updatedPosts,
            isEditing: false,
            editPost: null,
            editLoading: false,
            totalPosts: updatedTotalPost,
          };
        });
      })
      .catch((err) => {
        console.log(err);
        this.setState({
          isEditing: false,
          editPost: null,
          editLoading: false,
          error: err,
        });
      });
  };

  statusInputChangeHandler = (input, value) => {
    this.setState({ status: value });
  };

  deletePostHandler = (postId) => {
    this.setState({ postsLoading: true });
    const graphqlQuery = {
      query: `
      mutation {
        deletePost(id: "${postId}")
      }
      `,
    };
    fetch("http://localhost:8080/graphql", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + this.props.token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(graphqlQuery),
    })
      .then((res) => {
        return res.json();
      })
      .then((resData) => {
        if (resData.errors) {
          throw new Error("Deleting the post failed!");
        }
        console.log(resData);
        this.loadPosts();
        // this.setState((prevState) => {
        //   const updatedPosts = prevState.posts.filter((p) => p._id !== postId);
        //   return { posts: updatedPosts, postsLoading: false };
        // });
      })
      .catch((err) => {
        console.log(err);
        this.setState({ postsLoading: false });
      });
  };

  errorHandler = () => {
    this.setState({ error: null });
  };

  catchError = (error) => {
    this.setState({ error: error });
  };

  render() {
    return (
      <Fragment>
        <ErrorHandler error={this.state.error} onHandle={this.errorHandler} />
        <FeedEdit
          editing={this.state.isEditing}
          selectedPost={this.state.editPost}
          loading={this.state.editLoading}
          onCancelEdit={this.cancelEditHandler}
          onFinishEdit={this.finishEditHandler}
        />
        <section className="feed__status">
          <form onSubmit={this.statusUpdateHandler}>
            <Input
              type="text"
              placeholder="Your status"
              control="input"
              onChange={this.statusInputChangeHandler}
              value={this.state.status}
            />
            <Button mode="flat" type="submit">
              Update
            </Button>
          </form>
        </section>
        <section className="feed__control">
          <Button mode="raised" design="accent" onClick={this.newPostHandler}>
            New Post
          </Button>
        </section>
        <section className="feed">
          {this.state.postsLoading && (
            <div style={{ textAlign: "center", marginTop: "2rem" }}>
              <Loader />
            </div>
          )}
          {this.state.posts.length <= 0 && !this.state.postsLoading ? (
            <p style={{ textAlign: "center" }}>No posts found.</p>
          ) : null}
          {!this.state.postsLoading && (
            <Paginator
              onPrevious={this.loadPosts.bind(this, "previous")}
              onNext={this.loadPosts.bind(this, "next")}
              lastPage={Math.ceil(this.state.totalPosts / 2)}
              currentPage={this.state.postPage}
            >
              {this.state.posts.map((post) => (
                <Post
                  key={post._id}
                  id={post._id}
                  author={post.creator.name}
                  date={new Date(post.createdAt).toLocaleDateString("en-US")}
                  title={post.title}
                  image={post.imageUrl}
                  content={post.content}
                  onStartEdit={this.startEditPostHandler.bind(this, post._id)}
                  onDelete={this.deletePostHandler.bind(this, post._id)}
                />
              ))}
            </Paginator>
          )}
        </section>
      </Fragment>
    );
  }
}

export default Feed;
