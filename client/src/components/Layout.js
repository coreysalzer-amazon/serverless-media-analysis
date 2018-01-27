import React, { Component } from 'react';
import { Auth } from 'aws-amplify'
import { Link } from 'react-router'
import PropTypes from 'prop-types'

import '../styles/AppSignedIn.css'
import '../styles/SideBar.css'


class Layout extends Component {
  // constructor(props) {
  //   super(props);
  //   this.signOut = this.signOut.bind(this);
  // }

  // selectedMenuItem(item) {
  //   this.props.state.selectedMenuItem(item);
  // }

  signOut() {
    console.log(Auth);
    Auth.signOut()
      .then(data => console.log(data))
      .catch(err => console.log(err));
  }

  render() {
    var username = localStorage.getItem("CognitoIdentityServiceProvider.29moqbhis5p3vcedcvmr7e49rm.LastAuthUser");
    if(this.props.authData != undefined) {
        username = this.props.authData.username;
    }  

    return (
      <div className="AppSignedIn">
        <div className="row profile">
          <div className="col-sm-3 col-xs-5">
            <div className="profile-sidebar">
              <div className="profile-usertitle">
                <div className="profile-usertitle-name">{username}</div>
              </div>
              <div className="profile-userbuttons">
                <button onClick={ this.signOut } className="btn btn-info btn-sm">Sign Out</button>
              </div>
              <div className="profile-usermenu">
                <ul className="nav">
                  <li className="active">
                    <Link to="/upload">
                    <i className="glyphicon glyphicon-upload"></i>
                    Upload </Link>
                  </li>
                  <li>
                    <Link to="/browse">
                    <i className="glyphicon glyphicon-picture"></i>
                    Browse Files </Link>
                  </li>
                  <li>
                    <Link to="/search-labels">
                    <i className="glyphicon glyphicon-search"></i>
                    Rekognition Labels </Link>
                  </li>
              
                </ul>
              </div>
            </div>
          </div>
          <div className="col-sm-9 col-xs-7">
            <div className="profile-content">
              { this.props.children }
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Layout.contextTypes = {
  router: PropTypes.object.isRequired
}

export default Layout;