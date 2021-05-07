//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//DataBase Code
mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;

//   // we're connected!
  const itemsSchema = new  mongoose.Schema({
    name:String
  });

  const Item = mongoose.model("Item",itemsSchema);

  const item1 = new Item({
    name:"Welcome to your todoList!"
  });
  const item2 = new Item({
    name: "Hit the + button to add an item."
  });
  const item3 = new Item({
    name: "<-- Hit this to delete an item."
  });

  const defaultToDoData = [item1,item2,item3];

  const listSchema = new mongoose.Schema({
    name:String,
    items: [itemsSchema]
  });

  const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {
//Getting the data stored in the database
  Item.find({},function(err,data){
    if (data.length === 0){
      Item.insertMany(defaultToDoData,function(err){
        if (err){
          console.log(err);
        }else{
          console.log("succesfully");
        }
      });
      res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: data});
    }
  });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  newItem = new Item({
    name: itemName
  });

  if (listName === "Today"){
    newItem.save();
    res.redirect("/");
  }else {
     List.findOne({name:listName},function(err,data){
       data.items.push(newItem);
       data.save();
       res.redirect("/"+listName);
     })
  }

  });

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkBox;
  const listName = req.body.listName;
  console.log(checkedItemId);

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Removed");
      }
    });
    res.redirect("/");
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,data){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }

});

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name:customListName},function(err,data){
    if (!err){
      if(!data){
        //Create a new list
        const list = new List({
          name: customListName,
          items: defaultToDoData
        });

        list.save();
        res.redirect("/"+customListName);
      }else{
        //Show an existing list
        res.render("list",{listTitle: customListName, newListItems: data.items})
      }
    }
  });

});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
