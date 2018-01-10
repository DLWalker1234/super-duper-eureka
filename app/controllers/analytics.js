const mongoose = require("mongoose");
const Analytics = mongoose.model("Analytics");
const Derp = mongoose.model("Derp");
const qs = require('querystring')
const url = require('url')


exports.createPagination = (req, pages, page) => {
  let params = qs.parse(url.parse(req.url).query);
  let str = '';
  let pageNumberClass;
  let pageCutLow = page - 1;
  let pageCutHigh = page + 1;
 
  if (page > 1) {
    str += '<li class="page-item no"><a class="page-link" href="?page='+(page-1)+'">Previous</a></li>';
  }
  
  if (pages < 6) {
    for (let p = 1; p <= pages; p++) {
      params.page = p;
      pageNumberClass = page == p ? "active" : "no";
      let href = '?' + qs.stringify(params);
      str += '<li class="'+pageNumberClass+'"><a class="page-link" href="'+ href +'">'+ p +'</a></li>';
    }
  }
  
  else {
   
    if (page > 2) {
      str += '<li class="no page-item"><a class="page-link" href="?page=1">1</a></li>';
      if (page > 3) {
        str += '<li class="out-of-range">...</li>';
      }
    }
   
    if (page === 1) {
      pageCutHigh += 2;
    } else if (page === 2) {
      pageCutHigh += 1;
    }
    
    if (page === pages) {
      pageCutLow -= 2;
    } else if (page === pages-1) {
      pageCutLow -= 1;
    }
    
    for (let p = pageCutLow; p <= pageCutHigh; p++) {
      if (p === 0) {
        p += 1;
      }
      if (p > pages) {
        continue
      }
      params.page = p;
      pageNumberClass = page == p ? "active" : "no";
      let href = '?' + qs.stringify(params);
      str += '<li class="page-item '+pageNumberClass+'"><a class="page-link" href="'+ href +'">'+ p +'</a></li>';
    }
    
    if (page < pages-1) {
      if (page < pages-2) {
        str += '<li class="out-of-range">...</li>';
      }
      str += '<li class="page-item no"><a class="page-link" href="?page='+pages+'">'+pages+'</a></li>';
    }
  }
 
  if (page < pages) {
    str += '<li class="page-item no"><a class="page-link" href="?page='+(page+1)+'">Next</a></li>';
  }
 
  return str;
}


exports.index = (req, res) => {
  let createPagination = exports.createPagination;
  const page = (req.params.page > 0 ? req.params.page : 1) - 1;
  const perPage = 10;
  const options = {
    perPage: perPage,
    page: page
  };

  let analytics, pageViews, derpCount, pagination;

  Analytics.list(options)
    .then(result => {
      analytics = result;
      return Analytics.count();
    })
    .then(result => {
      pageViews = result;
      pagination = createPagination(req, Math.ceil(pageViews / perPage), page+1)
      return Derp.countTotalDerps()
    })
    .then(result => {
      derpCount = result;
      res.render("pages/analytics", {
        title: "List of users",
        analytics: analytics,
        pageViews: pageViews,
        derpCount: derpCount,
        pagination: pagination,
        pages: Math.ceil(pageViews / perPage),
      });
    })
    .catch(error => {
      console.log(error);
      return res.render("pages/500");
    });
};
