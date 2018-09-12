'use strict';

const express = require("express");
const Results = require("../models/article");
const Comment = require("../models/note");
const cheerio = require('cheerio');
const request = require('request');

const app = express.Router();

app.get('/', (req, res) => {
    Results.find({}, null, {sort: {createdAt: 1}}, (err, data) => {
        if (data.length === 0) {

            let hbsObj = {
                message: 'No articles scraped',
                btn: 'Scrape the Orlando Sentinel',
                route: '#',
                customGoogleFont: 'Oxygen',
                customCss: './css/style.css',
                customJS: './javascript/scrape.js'
            }

            res.render("placeholder", hbsObj);

        } else {

            

        let hbsObj2 = {
            results: data,
            customGoogleFont: 'Oxygen',
            customCss: './css/style.css',
            customJS: './javascript/scrape.js'
        }


        res.render("index", hbsObj2);

        }
    })
});
app.get("/saved", (req, res) => {
  Results.find({saved: true}, null, {sort: {createdAt: 1}}, (err, data) => {
      if (data.length === 0) {

          let hbsObj3 = {
              message: 'No saved articles yet',
              btn: 'Return to Home Page',
              route: "/",
              customGoogleFont: 'Oxygen',
              customCss: './css/style.css',
              customJS: './javascript/scrape.js'
          }

          res.render("placeholder", hbsObj3);

      } else {

          let hbsObj4 = {
          results: data,
          customGoogleFont: 'Oxygen',
          customCss: './css/style.css',
          customJS: './javascript/scrape.js'
          }

          res.render("saved", hbsObj4)
      }
  })
});


app.get("/scraped", function(req, res) {
    
    request("http://www.orlandosentinel.com/", function(error, response, html) {
        

        const $ = cheerio.load(html);
        let result = {}

        $('li.trb_outfit_group_list_item').each((i, element) => {
            result.link = (($(element).find('a').attr('href')).split(".html")[0]);
            result.headline = $(element).find('h3').find('a').text().trim();
            result.summary = $(element).find('p.trb_outfit_group_list_item_brief').text().trim();
            result.img = $(element).find('a').find('img').attr('data-baseurl');
            result.createdAt = $(element).find('span.trb_outfit_categorySectionHeading_date').attr('data-dt');

            let entry = new Results(result);

            Results.find({headline: result.headline}, (err, data) => {
              
                    entry.save((err, data) => {
                        if (err) throw err;
                    });
                
            });
        });
        res.redirect("/");
    });
});

app.post("/saved/:id", (req, res) => {
  Results.findById(req.params.id, (err, data) => {
      if (data.saved) {
          Results.findByIdAndUpdate(req.params.id, {$set: {saved: false}}, {new: true}, (err,data) => {
              res.redirect("/");
          });
      } else {
          Results.findByIdAndUpdate(req.params.id, {$set: {saved: true}}, {new: true}, (err, data) => {
              res.redirect("/saved");
          });
      }
  });
});

app.post("/comment/:id", (req, res) => {
  const comment = new Comment(req.body);
  comment.save((err, doc) => {
      if (err) throw err;
      Results.findByIdAndUpdate(req.params.id, {$set: {"comments": doc._id}}, {new: true}, (err, newDoc) => {
          if (err) throw err;
          else {
              res.send(newDoc);
          }
      });
  });
});
app.get("/:id", (req, res) => {
    Results.findById(req.params.id, (err, data) => {
        res.json(data);
    });
});

app.get("/comment/:id", (req, res) => {
    const id = req.params.id;

    Results.findById(id).populate("comments").exec((err, data) => {
        res.json(data.comments);
    });
});

module.exports = app;