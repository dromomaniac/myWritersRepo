const NewsAPI = require('newsapi');
var fs = require('fs');
// require('dotenv').load({ silent: true });
// const newsapi = new NewsAPI(process.env.NEWS_APIKEY4);
const newsapi = new NewsAPI('66b6e3e14a5b4a0497a649b9d0af79f7');
var URL = require('url-parse');
const writeJsonFile = require('write-json-file');
const loadJsonFile = require('load-json-file');

//TODO: CHeck if userAuthors.json is empty, if it is, call the queryNewsAsync function to get the authors for that user
// if the the file is not empty, just return that data?

loadJsonFile('/Users/evanhendrix1/google_drive/programming/codeWorks/mywriters/server/utils/manualUserData.json')
  .then(artArr => {
    const articles = artArr.list;
    Promise.all(Object.keys(articles).map(articleId => {
        return exports.queryNewsAsync(articles[articleId])
      })
    ).then(response => {
      // filters empty arrays out
      const authorsForReal = response.filter(a => {
        if (a) return a
      });
    console.log('AUTHORSFORREAL: ', authorsForReal)

    fs.writeFile('./usersAuthors.json', authorsForReal.toString() , function (err) {
      if (err) throw err;
      console.log('Saved!');
    });



  })
  .catch(err => console.log(err));
});

// takes a single article object
// returns the author
exports.queryNewsAsync =  async (artObj) => {
  try {
    return await newsapi.v2.everything({
      q: artObj.resolved_title,
      language: 'en',
      sortBy: 'relevance',
    }).then(response => {
      // console.log('\nresponse frowm newsapi search: \n\n', response);
      const authorArrs = response.articles.filter(art =>
        isURLSame(art.url, artObj.resolved_url)
      ).map( art => {
        return art.author
      });

      console.log('authorArrs: ', authorArrs);

    return authorArrs.toString()
    });
  }
  catch (err) {
    console.log(err);
  }
};

const isURLSame = (url1, url2) => {
  let urlObj1 = URL(url1, true);
  let urlObj2 = URL(url2, true);
  return ( urlObj1.hostname===urlObj2.hostname ) && ( urlObj1.pathname===urlObj2.pathname );
}
