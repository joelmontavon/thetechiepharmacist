template = `
<style>
body {
  font-weight: 300;
}

.header {
  margin: 200px auto;
}

h2.large {
  font-size: 1.8em;
}

.right {
  text-align: right;
}

.left {
  text-align: left;
}

.center {
  text-align: center;
}

.column {
  float: left;
  width: 50%;
}

.card {
  margin-bottom: 30px;
  border: 1px solid #cccccc;
  border-radius: 8px;
  overflow: hidden;
  background: #ffffff;
  box-shadow: 1px 1px 5px 1px #CCCCCC;
}

.image .card {
  padding: 10px;
  height: 0;
  padding-bottom: calc(100% - 10px);
}

.row {
  display: flex;
  justify-content: space-evenly;
}

.side {
  max-width: 55%;
}

.main {
  max-width: 35%;
}

.item-wrapper  {
  display: flex;
  align-content: center;
  flex-direction: column;
}

.item {
  min-width: 150px;
  /*margin: 15px;
  padding: 30px;
  background: red;
  text-align: center;*/
}

.sticky {
  position: -webkit-sticky;
  position: sticky;
  top: 0;
  align-self: flex-start;
}

.full-height {
  height: 100%;
}

.spacer {
  margin-bottom: 150px;
}

img {
  max-width: 100%;
}

.mat-section {
	font-weight: bold;
	font-style: italic;
}

pre {
	padding: 10px;
    background: rgb(235, 235, 235);
}

code {
	color: black;
	font-family:Monaco, Menlo, "Ubuntu Mono", Consolas, source-code-pro, monospace;
}

code > .keyword {
	color: firebrick;
}

code > .quote {
	color: blue;
}

code > .comment {
	color: darkgreen;
}

code > .madlib {
	font-style: italic;
	font-weight: bold;
}

.reveal {
  opacity: 0;
  visibility: hidden;
  will-change: transform, opacity;
}
</style>

<h1 class="header reveal center">Welcome</h1>

<div class="row spacer">
   <div class="item-wrapper" style="width: 500px; align-content: center;">
       <div class="item reveal">

       </div>
   </div>
</div>

<div class="row spacer">
  <div class="main">
    <div class="item-wrapper">
      <div class="item center">
        <p class="reveal">I am a pharmacist. I have a business degree. I love computers. And, I am passionate about using data and technology to solve healthcare's problems.</p>
        <p class="reveal">I like to take on interesting problems, develop creative solutions, and learn along the way.</p>
      </div>
    </div>
  </div>
</div>


<div class="row spacer">
<div class="side">
  <div class="item-wrapper full-height">
    <div class="item sticky">
      <div id="cloud">
      </div>
    </div>
  </div>
</div>

<div class="main left">
  <div class="item-wrapper">
    <div class="item" style="height: 100vh; padding-top; 100px; padding-bottom: 100px;">
       <h2 class="edu large reveal" style="margin-top: 250px;">Education</h2>
       <div class="row">
         <div class="column">
           <img src="img/osu.jpg" style="margin: 16px;"></img>
         </div>
         <div class="column">
            <h3 class="reveal">The Ohio State University</h3>
            <p class="reveal">Doctor of Pharmacy<br>2003-2007</p>
            <p class="reveal">Master of Business Administration<br>2007-2009</p>
          </div>
        </div>
    </div>
    <div class="item" style="height: 100vh; padding-top; 100px; padding-bottom: 100px;">
       <h2 class="work-exp large reveal">Work Experience</h2>
        <p class="reveal">I have worked in pharmacies, health plans, a PBM, a health system, and currently at a measure developer. Along the way, I have had a broad exposure in clinical guidelines, formulary, pharmacy operations and workflow, clinical programs, pharmacy data, performance measurement, and Medicare Part D.</p>
        <div class="row">
          <div class="column">
            <img src="img/pqa.jfif" style="margin: 16px;"></img>
          </div>
          <div class="column">
             <h3 class="reveal">Director, Analytics and Performance Measurement</h3>
             <p class="reveal">Pharmacy Quality Alliance<br>Jul 2018 - Present</p>
           </div>
         </div>
         <div class="row">
           <div class="column">
             <img src="img/advocate.jfif" style="margin: 16px;"></img>
           </div>
           <div class="column">
              <h3 class="reveal">Pharmacy Information Technology Analyst</h3>
              <p class="reveal">Advocate Health Care<br>Jan 2018 - Jul 2018</p>
            </div>
          </div>
          <div class="row">
            <div class="column">
              <img src="img/aetna.jfif" style="margin: 16px;"></img>
            </div>
            <div class="column">
               <h3 class="reveal">Manager, Clinical Pharmacy</h3>
               <p class="reveal">Aetna<br>Mar 2015 - Dec 2017</p>
             </div>
           </div>
           <div class="row">
             <div class="column">
               <img src="img/optumrx.jfif" style="margin: 16px;"></img>
             </div>
             <div class="column">
                <h3 class="reveal">Medicare Quality Measures Manager</h3>
                <p class="reveal">Catamaran (now OptumRx)<br>Apr 2011 - Mar 2015</p>
              </div>
            </div>
            <div class="row">
              <div class="column">
                <img src="img/emblemhealth.jfif" style="margin: 16px;"></img>
              </div>
              <div class="column">
                 <h3 class="reveal">Manager, Medicare Pharmacy</h3>
                 <p class="reveal">EmblemHealth<br>Oct 2009 - Apr 2011</p>
               </div>
             </div>
    </div>
    <div class="item" style="height: 100vh; padding-top; 100px; padding-bottom: 100px;">
       <h2 class="large reveal">Technical Skills</h2>
        <p class="tech reveal">I love learning about the latest technologies just particularly interested in machine learning and natural language processing. Check out some of my projects:</p>
        <div class="row">
          <div class="column">
            <img src="img/file_type_js_official.svg" style="margin: 16px;"></img>
          </div>
          <div class="column">
             <h3 class="reveal">JavaScript</h3>
             <ul>
               <li class="reveal"><a href="#pdc">PDC Calculator</a></li>
               <li class="reveal"><a href="#med">Morphine Milligram Equivalents Calculator</img></a></li>
               <li class="reveal"><a href="#statins">Statin Conversion Dosing Calculator</a></li>
               <li class="reveal"><a href="#icd10">ICD-10 Explorer</a></li>
             </ul>
           </div>
         </div>
         <div class="row">
           <div class="column">
             <img src="img/file_type_python.svg" style="margin: 16px;"></img>
           </div>
           <div class="column">
              <h3 class="reveal">Python</h3>
              <ul>
                <li class="reveal"><a href="#risk-adj">Risk Adjustment</a></li>
                <li class="reveal"><a href="#cutpoints">Star Ratings Cutpoints</a></li>
              </ul>
            </div>
          </div>
          <div class="row">
            <div class="column">
              <img src="img/file_type_sas.svg" style="margin: 16px;"></img>
            </div>
            <div class="column">
               <h3 class="reveal">SAS</h3>
               <ul>
                 <li class="reveal"><a href="#pdc-sas">PDC with SAS</a></li>
               </ul>
             </div>
           </div>
           <div class="row">
             <div class="column">
               <img src="img/cql-logo.png" style="margin: 16px;"></img>
             </div>
             <div class="column">
                <h3 class="reveal">CQL</h3>
                <ul>
                  <li class="reveal"><a href="#cql-camp">CQL Runner</a></li>
                  <li class="reveal"><a href="#mat">Measure Authoring Tool</a></li>
                </ul>
              </div>
            </div>
    </div>
    <div class="item" style="height: 100vh; padding-top; 100px; padding-bottom: 100px;">
       <h2 class="hobbies large reveal">Hobbies</h2>
        <p class="reveal">On top of being a computer nerd, I love to cook and bake, bike, walk my dog, and brew (and drink) my own beer.</p>
        <ul>
          <li class="reveal"><a href="https://www.youtube.com/c/CarolineGirvan">Caroline Girvan</a></li>
          <li class="reveal"><a href="https://www.youtube.com/c/Heatherrobertsoncom">Heather Robertson</a></li>
          <li class="reveal"><a href="https://www.youtube.com/c/ClaireSaffitzxDessertPerson">Dessert Person</a></li>
          <li class="reveal"><a href="https://www.youtube.com/playlist?list=PLKtIunYVkv_SUyXj_6Fe53okfzM9yVq1F">It's Alive with Brad</a></li>
          <li class="reveal"><a href="https://www.youtube.com/c/JoshuaWeissman">Joshua Weissman</a></li>
          <li class="reveal"><a href="https://vuejs.org/">Vue.js</a></li>
          <li class="reveal"><a href="https://element-plus.org/en-US/">Element Plus</a></li>
          <li class="reveal"><a href="https://www.youtube.com/c/DudeDad">Dude Dad</a></li>
          <li class="reveal"><a href="https://www.michaelconnelly.com/series/#Bosch">Harry Bosch</a></li>
        </ul>
    </div>
  </div>
</div>
</div>

<div class="row spacer">
  <div class="main">
    <div class="item-wrapper">
      <div class="item center">
      <span style="font-size: 72px; text-align: center;">
        <a href="mailto:thetechiepharmacist@gmail.com" target="_blank"><img class="icon" width="60" height="60" src="https://i.pinimg.com/564x/8f/c3/7b/8fc37b74b608a622588fbaa361485f32.jpg"></img></a>
        <a href="https://www.linkedin.com/in/joel-montavon" target="_blank"><img class="icon" width="60" height="60" src="https://content.linkedin.com/content/dam/me/brand/en-us/brand-home/logos/In-Blue-Logo.png.original.png"></img></a>
        <a href="https://github.com/joelmontavon" target="_blank"><img class="icon" width="60" height="60" src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"></img></a>
      </span>
      </div>
    </div>
  </div>
</div>
`;

class HomePage extends HTMLElement {
   constructor(){
     super();
     this.attachShadow({ mode: 'open'});
     this.shadowRoot.innerHTML = template;
   }

   connectedCallback() {
     var self = this;

     function shrinkAll() {
       var els = self.shadowRoot.querySelectorAll('.cloud');
       els.forEach(function (el) {
            el.style.fontSize =  el.style.fontSize.substring(0,2)/2 + 'px';
            el.style.fontWeight = 'normal';
         })
       }

       function shrink(elem) {
         var els = self.shadowRoot.querySelectorAll('.cloud_' + elem.classList[0]);
         els.forEach(function (el) {
              el.style.fontSize =  el.style.fontSize.substring(0,2)/2 + 'px';
              el.style.fontWeight = 'normal';
              gsap.fromTo(el, {
                autoAlpha: 1
              }, {
                duration: 1.25,
                autoAlpha: 0.5,
                ease: "expo",
                overwrite: "auto"
              });
         })
       }

       function grow(elem) {
         var els = self.shadowRoot.querySelectorAll('.cloud_' + elem.classList[0]);
         els.forEach(function (el) {
              el.style.opacity = "0";
              el.style.fontSize =  el.style.fontSize.substring(0,2)*2 + 'px';
              el.style.fontWeight = 'bold';
              gsap.fromTo(el, {
                autoAlpha: 0
              }, {
                duration: 1.25,
                autoAlpha: 1,
                ease: "expo",
                overwrite: "auto"
              });
         })
       }

     function animateFrom(elem, direction) {
       direction = direction || 1;
       var x = 0,
           y = direction * 100;

       elem.style.transform = "translate(" + x + "px, " + y + "px)";
       elem.style.opacity = "0";
       gsap.fromTo(elem, {
         x: x,
         y: y,
         autoAlpha: 0
       }, {
         duration: 1.25,
         x: 0,
         y: 0,
         autoAlpha: 1,
         ease: "expo",
         overwrite: "auto"
       });
     }

     function hide(elem) {
       var els = self.shadowRoot.querySelectorAll('.cloud_' + elem.classList[0])
       els.forEach(function (el) {
         gsap.to(el, {
           duration: 1.25,
           autoAlpha: 0,
           ease: "expo",
           overwrite: "auto"
         });
       })
     }

     function enter(elem) {
       animateFrom(elem);
       grow(elem);
     }

     function leave(elem) {
       shrink(elem);
       gsap.to(elem, {autoAlpha: 0});
     }

     function enterBack(elem) {
       animateFrom(elem, -1);
       grow(elem);
     }

     function leaveBack(elem) {
       shrink(elem);
       hide(elem);
     }

     function drawWordCloud() {

      var big = 64;
      var med = 42;
      var small = 24;

      // List of words
      var myWords = [
        {text:"PharmD", class:"edu", size: big},
        {text:"MBA", class:"edu", size: big},
        {text:"The Ohio State University", class:"edu", size: med},
        {text:"Buckeyes", class:"edu", size: small},
        {text:"Pharmacist", class:"work-exp", size: big},
        {text:"Clinical Guidelines", class:"work-exp", size: small},
        {text:"Pharmacy Operations and Workflow", class:"work-exp", size: small},
        {text:"Healthcare Data", class:"work-exp", size: small},
        {text:"Performance Measurement", class:"work-exp", size: small},
        {text:"Medicare Part D", class:"work-exp", size: med},
        {text:"Health Plan", class:"work-exp", size: med},
        {text:"PBM", class:"work-exp", size: small},
        {text:"Pharmacy", class:"work-exp", size: med},
        {text:"Health System", class:"work-exp", size: small},
        {text:"Measure Developer", class:"work-exp", size: small},
        {text:"Data Scientist", class:"tech", size: small},
        {text:"Programmer", class:"tech", size: big},
        {text:"Data Engineer", class:"tech", size: small},
        {text:"Data Analyst", class:"tech", size: med},
        {text:"SAS", class:"tech", size: big},
        {text:"SQL", class:"tech", size: big},
        {text:"Python", class:"tech", size: med},
        {text:"VBA", class:"tech", size: small},
        {text:"CQL", class:"tech", size: small},
        {text:"JavaScript", class:"tech", size: big},
        {text:"Node.js", class:"tech", size: small},
        {text:"C++", class:"tech", size: small},
        {text:"FHIR", class:"tech", size: small},
        {text:"Microsoft Office", class:"tech", size: small},
        {text:"Tableau", class:"tech", size: small},
        {text:"Measure Authoring Tools", class:"tech", size: small},
        {text:"Bonnie", class:"tech", size: small},
        {text:"Cooking", class:"hobbies", size: small},
        {text:"Baking", class:"hobbies", size: small},
        {text:"Biking", class:"hobbies", size: small},
        {text:"Brewing Beer", class:"hobbies", size: small},
        {text:"Drinking Beer", class:"hobbies", size: small}
      ]

      // set the dimensions and margins of the graph
      var margin = {top: 10, right: 10, bottom: 10, left: 10},
        width = 600 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

      // append the svg object to the body of the page
      var el = self.shadowRoot.querySelector("#cloud");
      var svg = d3.select(el).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("style", "height:100vh; width:100%; padding-top: 200px;")
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

      // Constructs a new cloud layout instance. It run an algorithm to find the position of words that suits your requirements
      var layout = d3.layout.cloud()
        .size([width, height])
        .words(myWords)
        .padding(10)
        .fontSize(function(d) { return d.size; })
        .on("end", draw);
        layout.start();

      // This function takes the output of 'layout' above and draw the words
      // Better not to touch it. To change parameters, play with the 'layout' variable above
      function draw(words) {
      svg
        .append("g")
          .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
          .selectAll("text")
            .data(words)
          .enter().append("text")
            .attr("class", function (d) { return 'cloud_' + d.class + ' cloud'; })
            .style("font-size", function(d) { return d.size + "px"; })
            .attr("text-anchor", "middle")
            .attr("transform", function(d) {
              return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .text(function(d) { return d.text; });
    }
  }

    drawWordCloud();
    shrinkAll();
    gsap.registerPlugin(ScrollTrigger);

    this.shadowRoot.querySelectorAll(".reveal").forEach(function(elem) {
       hide(elem); // assure that the element is hidden when scrolled into view
       ScrollTrigger.create({
         trigger: elem,
         onEnter: function() { enter(elem) },
         onLeave: function() { leave(elem) },
         onEnterBack: function() { enterBack(elem) },
         onLeaveBack: function() { leaveBack(elem) } // assure that the element is hidden when scrolled into view
       });
     });
   }
}
window.customElements.define('home-page', HomePage);
