const proxyRoute = process.env.PROXY_ROUTE;
const moment = require('moment');
const {formatQuotes} = require('../../../helpers/formatQuotes');
const {translations} = require('../../../helpers/translations')

module.exports.managePosts = ({user, blogs, shop}) => {
  
  const displayPosts = (data) => blogs.map((blog, i) => {
      return `<div key=${i} class='pb-5'>
                <div id='${blog.slug}'> 
                    <a href='${proxyRoute}/blog/${blog.slug}'><h3>${formatQuotes(blog.title)}</h3></a>
                    <p class='mark'>
                        ${translations['WrittenBy'][shop ? shop.language : 'English']} ${blog.postedBy.name} | ${translations['PublishedOn'][shop ? shop.language : 'English']} ${moment(blog.updatedAt).format('YYYY-MM-DD')}
                    </p>
                    <button ng-click='deleteConfirm(${formatQuotes(JSON.stringify(blog.slug))})' class='community-button-danger pure-button'>
                         ${translations['Delete'][shop ? shop.language : 'English']}
                    </button>
                </div>
              </div>
              <br/>
      `;
  }).join(' ')

  return `
      <div ng-controller='managePostsController'>
          <div class='community-card community-admin-padding'>
            <div id='error-message' class='text-center'>
              <h3 >${translations['ManagePosts'][shop ? shop.language : 'English']}</h3><span ng-click='reloadPage()' class='reload'>&#x21bb;</span>
            </div>
            <div>
              ${displayPosts(blogs)}
            </div>
          </div>
      </div>`
};

module.exports.managePostsJS = (user) => {  
  const displayPosts = (data, proxy) => data.map((blog, i) => {
      return `<div key=${i} class="pb-5">
                  <a href='${proxy}/blog/${blog.slug}'><h3>${blog.title}</h3></a>
                  <p class="mark">
                      Written by ${blog.postedBy.name} | Published on ${blog.updatedAt.split('T')[0]}
                  </p>
                  <button class="btn btn-sm btn-danger"}>
                      Delete
                  </button>
              </div>
      `;
  }).join(' ')

  return `
    tribeApp.controller('managePostsController', function($scope, $http) {
      console.log('managePosts function ran');
      $scope.proxyRoute = '${proxyRoute}';
      $scope.displayPosts = ${displayPosts};

      $scope.deleteConfirm = function(slug){
          let answer = window.confirm('Are you sure you want to delete this Post?');
          if (answer) {
              $scope.deletePost(slug);
          }
      }

      $scope.deletePost = function(slug){
        console.log('post to delete:',slug);
        $http.delete('${proxyRoute}/user/blog/'+slug+'?email={{ customer.email }}&name={{ customer.name }}&hash={{ customer.email | append: 'somecrazyhash' | md5 }}')
                 .success(function(data) {
                  document.getElementById(slug).innerHTML =
                    '<h3>'+data.message+'</h3>';
            })
          .error(function(data) {
            console.log('Error: ' + data);
            document.getElementById(slug).innerHTML =
             '<h3 style="color:red;">'+data.error+'</h3>';
           });
      }
      $scope.reloadPage = function(post){
        console.log('ran reloadPage func')
        location.reload();
      }
    });
  `
}
