import wixData from 'wix-data';

$w.onReady(function () {
  $w("#button4").onClick(function () {
    const caption = $w("#textBox1").value;
    // const image = $w('#uploadButton1').value
    const tags = $w("#textBox2").value
    
    // Define an array of bad words or phrases
    const Filter = require('bad-words');
    const filter = new Filter();
    
    if (filter.isProfane(caption) || filter.isProfane(tags)) {
      // Display an error message or perform any desired action
      console.log("Caption contains inappropriate content. Please revise.");
      // You can also use $w("#errorMessage").show(); to display an error message
      return;
    }
    
    // Proceed with saving the caption to the database if no bad content is found
    console.log("Caption is appropriate. Proceeding with database insertion.");
    
    // Prepare the data to be inserted
    console.log("caption", caption)
    console.log("caption", tags)
    // console.log("caption", image)
    const itemData = {
      Caption: caption,
      Title: tags, 
      // Image: image,
    };
    
    // // Insert the data into a specific database collection
    // wixData.insert("UserImagePosts", itemData)
    //   .then((results) => {
    //     console.log("Data inserted successfully:", results);
    //   })
    //   .catch((error) => {
    //     console.error("Error inserting data:", error);
    //   });
  });
});