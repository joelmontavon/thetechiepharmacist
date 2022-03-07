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
  max-width: 35%;
}

.main {
  max-width: 55%;
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

<h1 class="header reveal center">The Measure Authoring Tool Crash Course</h1>

<div class="row spacer">
   <div class="item-wrapper" style="width: 500px; align-content: center;">
       <div class="item reveal">
            <img src="img/shot-in-arm.png" alt="">
       </div>
   </div>
</div>

<div class="row spacer">
  <div class="main">
    <div class="item-wrapper">
      <div class="item center">
        <p class="reveal">This tutorial will walk you thru the steps to creating a digital measure using CQL and FHIR with CMS' <a href="https://www.emeasuretool.cms.gov/">Measure Authoring Tool (MAT)</a>. The measure will be based upon the Advisory Committee on Immunization Practices (ACIP) influenza vaccine recommendations for 2021-22 on the <a href="https://www.cdc.gov/flu/professionals/acip/summary/summary-recommendations.htm">CDC website</a>.</p>
      </div>
    </div>
  </div>
</div>

<div class="row spacer">
<div class="side image reveal reveal_left">
  <div class="item-wrapper">
    <div class="item card">
  <img src="https://www.cdc.gov/flu/images/freeresources/animated-fight-flu-arm-flex.gif" style="width: 500px;"></img>
      <!--<iframe src="https://www.cdc.gov/coronavirus/2019-ncov/vaccines/vaccine-finder-widget_1.html" scrolling="no" height="520" frameborder="0" width="280" title="Vaccine Finder Widget" style="overflow: hidden; frameborder="0"><!– Vaccine Finder Widget !–> </iframe>-->
    </div>
  </div>
</div>
<div class="main">
  <div class="item-wrapper">
    <div class="item">
      <h2 class="large reveal">Practice Guidelines</h2>
      <p class="reveal">The influenza vaccine is recommended for all persons aged &ge; 6 months who do not have contraindications. Some children aged 6 months through 8 years require two doses of influenza vaccine but all adults and children should get at least one dose. The vaccine should ideally be administered by the end of October, but should continue to be offered as long as the virus is still active and the vaccine is available. And, for the most part, vaccination in July and August should be avoided, even if vaccine is available during these months.</p>
      <p class="reveal">For persons with moderate or severe acute illness with or without fever (e.g., COVID), the influenze vaccine should be deferred until they have recovered. Persons who are pregnant or who might be pregnant during the influenza season should receive influenza vaccine. For pregnant and immunocompromised persons (and their caregivers and close contacts), one of the inactivated or recombinant vaccines should be given and not the live attenuated one (i.e., LAIV4). Persons with an egg allergy (e.g., anaphylaxis) should not be given one of the egg-based vaccines (i.e., IIV4, RIV4, or LAIV4). Precaution should be given to persons with a history of Guillain-Barré syndrome within 6 weeks of receipt of influenza vaccine. And, of course, persons with a history of severe allergic reaction to a previous dose of any influenza vaccine are contraindicated.</p>
    </div>
  </div>
</div>
</div>

<div class="row spacer">
<div class="main">
    <div class="item-wrapper">
      <div class="item">
        <h2 class="large reveal">Measure Specifications</h2>
        <p class="reveal">For my measure, I am simplifying the ACIP influenza recommendations as follows:</p>
        <p class="reveal"><b>Denominator</b>: Individuals &ge; 6 months of age or older as of September 1st</p>
        <p class="reveal"><b>Exclusions</b>:
        <ul class="reveal">
          <li>Individuals with a history of severe allergic reaction to the influenza vaccine</li>
          <li>Individuals with a history of history of Guillain-Barré syndrome</li>
        </ul>
        </p class="reveal">
        <p class="reveal"><b>Numerator</b>: Individuals with &ge; 1 dose of the influenza vaccine from September 1st to May 31st</p>
      </div>
    </div>
</div>
   <div class="side image reveal reveal_right">
     <div class="item-wrapper">
       <div class="item">
         <img width="500" src="img/ruler.jpg" alt="">
       </div>
     </div>
   </div>
</div>

<h1 class="header reveal center">The Measure Authoring Tool</h2>

<div class="row spacer">
<div class="side image reveal reveal_left">
  <div class="item-wrapper">
    <div class="item card">
      <img width="500" src="img/new-measure1.png" alt="img/new-measure1:9:png">
    </div>
  </div>
</div>
  <div class="main">
  <div class="item-wrapper">
    <div class="item">
      <p class="reveal">The first step is creating a new measure in the <span class="mat-section">Measure Library</span>. You will need to define a name for your measure, the data model (i.e., FHIR or QDM), a library name that will be created for your measure, and an abbreviated title. You will also need to specify whether higher or lower scores are better and if the measure is patient-based.</p>
      <p>Once your measure has been created, it will take you to the <span class="mat-section">Measure Details</span> section in the <span class="mat-section">Measure Composer</span>. This section allows you to provide a lot of useful information for those that will be using your measure. The information that you entered will already be populated but there are a few additional details that you will need to enter before you can go any further. These include the measure steward, a brief description of the measure, and the measure type (e.g., structure, process, outcome). Of course, there is a lot more that you can do in this section but will not go into much detail.</p>
      <p>Now that we've setup our measure, we can get to work in the <span class="mat-section">CQL Workspace</span>.</p>
    </div>
  </div>
</div>
</div>

<div class="row spacer">
<div class="side">
  <div class="item-wrapper">
    <div class="item">
      <h2 class="large reveal">Includes</h2>
      <p class="reveal">The <span class="mat-section">Includes</span> section allows you to search for and add existing libraries to your code. You can create your own libaries to reuse value sets, codes, functions, etc. across measures.</p>
      <p class="reveal">Unfortunately, I don't know that there is any easy way to view all of the libraries available. It will not allow you to search for any empty string. However, it does appear to be convention to include FHIR in the library name.</p>
      <p class="reveal">By selecting a value set from the available libraries, defining the alias, and hitting save, the tool will add some code with the following syntax:</p>
      <pre class="reveal"><code><span class="keyword">include</span> <span class="quote madlib">Library Name</span> <span class="keyword">version</span> <span class="quote madlib">'X.X.XXX'</span> <span class="keyword">called</span> <span class="quote madlib">Alias</span></code></pre>
      <p class="reveal">I'm using a few commonly used FHIR libraries in my code:</p>
      <pre class="reveal"><code><span class="keyword">include</span> <span class="quote">SupplementalDataElementsFHIR4</span> <span class="keyword">version</span> <span class="quote">'2.0.000'</span> <span class="keyword">called</span> <span class="quote">SDE</span>
<span class="keyword">include</span> <span class="quote">MATGlobalCommonFunctionsFHIR4</span> <span class="keyword">version</span> <span class="quote">'6.1.000'</span> <span class="keyword">called</span> <span class="quote">Global</span>
<span class="keyword">include</span> <span class="quote">FHIRHelpers</span> <span class="keyword">version</span> <span class="quote">'4.0.001'</span> <span class="keyword">called</span> <span class="quote">FHIRHelpers</span></code></pre>
    </div>
  </div>
</div>
<div class="main image reveal reveal_right">
  <div class="item-wrapper">
    <div class="item card">
      <img width="500" src="img/includes1.png" alt="img/includes1:6:png">
    </div>
  </div>
</div>
</div>

<div class="row spacer">
<div class="side image reveal reveal_left">
  <div class="item-wrapper">
    <div class="item card">
      <img width="500" src="img/value-sets1.png" alt="img/value-sets1:9:png">
    </div>
  </div>
</div>
<div class="main">
  <div class="item-wrapper">
    <div class="item">
      <h2 class="large reveal">Value Sets</h2>
      <p class="reveal">The <span class="mat-section">Value Sets</span> section allows you to reference value sets from the <a href="https://vsac.nlm.nih.gov/welcome">Value Set Authority Center (VSAC)</a> in your measure. You need to sign into UMLS using an API key to add a value set to your code. You can sign in using the link at the top of the page. And, they provide simple instructions to find your API key if you don't already have it.</p>
      <p class="reveal">To add a value set to your code, you first need to find the OID from the VSAC. Then, you enter that into the search form and retrieve the value set. The value set is not added to your code until you select apply. The tool will then add some code with the following syntax:</p>
      <pre class="reveal"><code><span class="keyword">valueset</span> <span class="quote madlib">"Value Set Name"</span><span class="punct">:</span> <span class="quote madlib">'URL'</span></code></pre>
      <p class="reveal">For the exclusions in my measure, I found a value sets for identifying individuals with Guillain-Barré syndrome including ICD-10 and SNOMED-CT codes and another for identifying individuals with an allergy to the influenza vaccine including SNOMED-CT codes. And, for the numerator, I found a value set to identify the influenza vaccine including CPT, CVX, HCPCS, ICD10PCS, RXNORM, and SNOMEDCT codes. The final code looks like this:</p>
      <pre class="reveal"><code><span class="keyword">valueset</span> <span class="quote">"Allergy to Influenza Vaccine"</span>: <span class="quote">'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.526.3.1256'</span>
<span class="keyword">valueset</span> <span class="quote">"Guillain Barre Syndrome"</span>: <span class="quote">'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.666.5.490'</span>
<span class="keyword">valueset</span> <span class="quote">"Influenza Virus Vaccine and Vaccination"</span>: <span class="quote">'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113762.1.4.1221.108'</span></code></pre>
    </div>
  </div>
</div>
</div>

<div class="row spacer">
<div class="main">
  <div class="item-wrapper">
    <div class="item">
      <h2 class="large reveal">Codes</h2>
      <p class="reveal">The <span class="mat-section">Codes</span> section allows you to reference specific codes from various terminologies. As with the value sets, you need to sign into UMLS using an API key to add a value set to your code. You can sign in using the link at the top of the page. And, they provide simple instructions to find your API key if you don't already have it.</p>
      <p class="reveal">To add a code, you first need to find the OID from the VSAC. Then, you enter that into the search form and retrieve the value set. The value set is not added to your code until you select apply. The tool will then add some code with the following syntax:</p>
      <pre class="reveal"><code><span class="keyword">codesystem</span> <span class="quote madlib">"Code System"</span>: <span class="quote madlib">'URL'</span>
<span class="keyword">code</span> <span class="quote madlib">"Code Set Name"</span><span class="punct">:</span> <span class="quote madlib">'Code'</span> <span class="keyword">from</span> <span class="quote madlib">"Code System"</span> <span class="keyword">display</span> <span class="quote madlib">'Display'</span></code></pre>
      <p class="reveal"><i>Note that not all code systems are in VSAC yet.</i></p>
    </div>
  </div>
</div>
<div class="image side reveal reveal_left">
  <div class="item-wrapper">
    <div class="item card">
      <img width="500" src="img/codes1.png" alt="img/codes1:5:png">
    </div>
  </div>
</div>
</div>

<div class="row spacer">
<div class="side image reveal reveal_right">
  <div class="item-wrapper">
    <div class="item card">
      <img width="500" src="img/parameters1.png" alt="img/parameters1:4:png">
    </div>
  </div>
</div>
<div class="main reveal">
  <div class="item-wrapper">
    <div class="item">
      <h2 class="large reveal">Parameters</h2>
      <p class="reveal">The <span class="mat-section">Parameters</span> section allows you to provide the code with parameters to be used in your code. Parameters follow the following syntax:</p>
      <pre class="reveal"><code><span class="keyword">parameter</span> <span class="quote madlib">"Parameter Name"</span> <span class="keyword madlib">Data Type</span> [<span class="keyword">default</span> <span class="madlib">Default Value</span>]</code></pre>
      <p class="reveal">The measurement period is added by default.</p>
      <pre class="reveal"><code><span class="keyword">parameter</span> <span class="quote">"Measurement Period"</span> <span class="keyword">Interval&lt;DateTime&gt;</span></code></pre>
      <p class="reveal"><i>Note that Bonnie only allows the measure period as a parameter.</i></p>
    </div>
  </div>
</div>
</div>

<div class="row spacer">
<div class="main">
  <div class="item-wrapper">
    <div class="item">
      <h2 class="large reveal">Functions</h2>
      <p class="reveal">I've skipped over the <span class="mat-section">Definitions</span> to the <span class="mat-section">Functions</span> section. With a function, you provide one or more inputs and get an output. This is a way to simplify your code if you need to perform the same calculation again and again.</p>
      <p class="reveal">To create a function, you need to create a name and add your parameters. For each parameter, you will need to select a data type. Then, you add your CQL code in the CQL Expression Editor below. The syntax for a function is:</p>
      <pre class="reveal"><code><span class="keyword">define function</span> <span class="quote madlib">"Function Name"</span>(Arg1, Arg2, ...):
<span class="madlib">Your CQL code here...</span></code></pre>
      <p class="reveal">For my measure, I will need to extract the year from the measurement period.	This doesn't require a function as I'm only doing this once in my code but makes for a good example. The function takes a <code><span class="keyword">DateTime</span></code> as its only argument and returns the year as an <code><span class="keyword">Integer</span></code>.</p>
      <pre class="reveal"><code><span class="keyword">define function</span> <span class="quote">"FromYear"</span>(MyDate <span class="keyword">DateTime</span>):
<span class="keyword">year from</span> <span class="quote">"MyDate"</span></code></pre>
    </div>
  </div>
</div>
<div class="side image reveal reveal_left">
  <div class="item-wrapper">
    <div class="item card">
      <img width="500" src="img/functions1.png" alt="img/functions1:8:png">
    </div>
  </div>
</div>
</div>

<div class="row spacer">
<div class="side image">
  <div class="item-wrapper full-height">
    <div class="item card sticky">
      <img id="definitions" width="500" src="img/definitions1.svg" alt="img/definitions1:4:png"></img>
    </div>
  </div>
</div>

<div class="main left">
  <div class="item-wrapper">
    <div class="item">
       <h2 class="large reveal">Definitions</h2>
        <p class="reveal">The <span class="mat-section">Definitions</span> sections allow us to define expressions that can be referenced in our code. The syntax for a definition is:</p>
        <pre class="reveal"><code><span class="keyword">define</span> <span class="quote madlib">"Definition Name"</span>:
<span class="madlib">Your CQL code here...</span></code></pre>
        <p class="reveal">We need several definitions but will start with the initial population which includes individuals 6 months or older as of September 1st. CQL has some very useful date operators. <code><span class="keyword">Start of</span></code> and <code><span class="keyword">End of</span></code> return the starting or ending <code><span class="keyword">DateTime</span></code> from the <code><span class="keyword">Interval&lt;DateTime&gt;</span></code>.</p>
        <pre class="reveal"><code><span class="keyword">define</span> <span class="quote">"Initial Population"</span>:
<span class="keyword">AgeInMonthsAt</span>(<span class="keyword">start of</span> <span class="quote">"Flu Season"</span>)>= 6</code></pre>
        <p class="reveal">For our measure, the denominator is the same as the eligible population.</p>
        <pre class="reveal"><code><span class="keyword">define</span> <span class="quote">"Denominator"</span>:
<span class="quote">"Initial Population"</span></code></pre>
        <p class="reveal">The exclusions include individuals with Guillain-Barré syndrome or an allergy to the influenza vaccine. Using a query, we retrieve the resources (e.g., <code>[<span class="quote">"Condition"</span>]</code>) and filter using the value sets that we previously defined (e.g., <code>[<span class="quote">"Condition"</span>: <span class="quote">"Guillain Barre Syndrome"</span>]</code>). For the <code><span class="quote">AllergyIntollerance</span></code> resource, we need to further limit the results to those with the appropriate statuses. We use an alias for the result and a </span class="keyword">where</span> clause to further filter the result to only those that meet the condition. The <code><span class="keyword">union</span></code> operator is used to append the results of the retrieve operations and then the <code><span class="keyword">exists</span></code> operator tests whether the list contains any elements.</p>

<!--Queries use the following syntax:</p>
<pre class="reveal"><code>&lt;primary-source&gt; &lt;alias&gt;
&lt;with-or-without-clauses&gt;
&lt;where-clause&gt;
&lt;return-clause&gt;
&lt;sort-clause&gt;</code></pre>
<p class="reveal">Queries may contain clauses. The table below lists the different clauses and describes the operation that each performs:</p>
<table>
<tr class="reveal">
<th>Clause</th><th>Operation</th>
</tr>
<tr class="reveal">
<td>Relationship (with/without)</th><td>Allows relationships between the primary source and other clinical information to be used to filter the result.</th>
</tr>
<tr class="reveal">
<td>Where</th><td>The where clause allows conditions to be expressed that filter the result to only the information that meets the condition.</th>
</tr>
<tr class="reveal">
<td>Return</th><td>The return clause allows the result set to be shaped as needed, removing elements, or including new calculated values.</th>
</tr>
<tr class="reveal">
<td>Sort</th><td>The sort clause allows the result set to be ordered according to any criteria as needed.</th>
</tr>
</table>


<p class="reveal">-->
     <pre class="reveal"><code><span class="keyword">define</span> <span class="quote">"Denominator Exclusions"</span>:
<span class="keyword">exists</span> ( [<span class="quote">"Condition"</span>: <span class="quote">"Guillain Barre Syndrome"</span>]
<span class="keyword">union</span> [<span class="quote">"Condition"</span>: <span class="quote">"Allergy to Influenza Vaccine"</span>]
<span class="keyword">union</span> [<span class="quote">"Observation"</span>: <span class="quote">"Allergy to Influenza Vaccine"</span>]
<span class="keyword">union</span> ( ( [<span class="quote">"AllergyIntolerance"</span>: <span class="quote">"Allergy to Influenza Vaccine"</span>] ) intol
  <span class="keyword">where</span> intol.clinicalStatus = Global.<span class="quote">"allergy-active"</span>
    <span class="keyword">and</span> intol.verificationStatus = Global.<span class="quote">"allergy-confirmed"</span>
)
<!--<span class="comment">/*union ( ( ["ImmunizationRecommendation": "Influenza Virus Vaccine and Vaccination"] ) rec where rec.recommendation.forecastStatus = true)*/</span>-->
)</code></pre>

     <p class="reveal">The last thing we need to do is define the numerator which includes individuals that recieved &ge; 1 dose of the influenze vaccine. This may be captured via more than one resource (e.g., <code><span class="quote">MedicationAdministration</span></code>, <code><span class="quote">MedicationDispense</span></code>, <code><span class="quote">Encounter</span></code>, <code><span class="quote">Immunization</span></code>).</p>
     <pre class="reveal"><code><span class="keyword">define</span> <span class="quote">"Numerator"</span>:
<span class="keyword">exists</span> ((([<span class="quote">"MedicationAdministration"</span>: <span class="quote">"Influenza Virus Vaccine and Vaccination"</span>])admin
  <span class="keyword">where</span> admin.effective in <span class="quote">"Flu Season"</span>
    and admin.status = 'completed'
)
<span class="keyword">union</span> (([<span class="quote">"MedicationDispense"</span>: <span class="quote">"Influenza Virus Vaccine and Vaccination"</span>])disp
    <span class="keyword">where</span> disp.whenPrepared in <span class="quote">"Flu Season"</span>
      and disp.status = 'completed'
)
<span class="keyword">union</span> (([<span class="quote">"Encounter"</span>: <span class="quote">"Influenza Virus Vaccine and Vaccination"</span>])entr
    <span class="keyword">where</span> start of entr.period in <span class="quote">"Flu Season"</span>
      and entr.status = 'finished'
)
<span class="keyword">union</span> (([<span class="quote">"Immunization"</span>: <span class="quote">"Influenza Virus Vaccine and Vaccination"</span>])immun
    <span class="keyword">where</span> immun.occurrence in <span class="quote">"Flu Season"</span>
      and immun.status = 'completed'
)
)</code></pre>
    </div>
</div>
  </div>
</div>

<div class="row spacer">
  <div class="main">
    <div class="item-wrapper">
      <div class="item">
        <p class="reveal">Now, we can view all of our code in the <span class="mat-section">CQL Library Editor</span> but our work is not done quite yet.</p>
        <p class="reveal">Next, we need to go to the <span class="mat-section">Population Workspace</span> and select the appropriate definition for each population (e.g., initial populations, denominators, denominator exclusions, and numerators). We've made this easy by naming our definitions to align with these populations.</>
        <p class="reveal">From the <span class="mat-section">Measure Packager</span>, we add these populations to the package grouping and save. Then, at the bottom of that page, we can create the <a href="assets/fluvax-v0-0-008-FHIR-4-0-1.zip">measure package</a> and export it. This zip file can be loaded into <a href="https://bonnie-fhir.healthit.gov/">Bonnie</a> for testing. More to come on that.</>
      </div>
    </div>
  </div>
  <div class="side image reveal reveal_right">
    <div class="item-wrapper">
      <div class="item card">
        <img width="500" src="img/package-measure1.png" alt="img/package-measure1:13:png">
      </div>
    </div>
  </div>
</div>

<div class="row spacer">
  <div class="main">
    <div class="item-wrapper">
      <div class="item">
      <p class="reveal">We've done it! Congrats on sticking with me! If you are interesting in learning more about these topics, below are some great resources for getting started:</p>
      <ul class="reveal" style="text-align: left;">
        <li><a href="https://www.emeasuretool.cms.gov/sites/default/files/2021-06/MAT%20User%20Guide%20v6.10%20FHIR%20.pdf">Measure Authoring Tool (MAT) User Guide</a></li>
        <li><a href="https://cql.hl7.org/">CQL Specification</a></li>
        <li><a href="https://github.com/cqframework/CQL-Formatting-and-Usage-Wiki/wiki/Cooking-with-CQL-Examples">Cooking with CQL Q&A</a></li>
        <li><a href="https://github.com/cqframework/cqf-exercises">CQL Exercises</a></li>
        <li><a href="https://build.fhir.org/index.html">FHIR Specification</a></li>
        <li><a href="https://chat.fhir.org/login/">FHIR Community</a></li>
      </ul>
      <!--<img src="http://hl7.org/fhir/2016may/assets/images/fhir-logo-www.png"></img>-->
      </div>
    </div>
  </div>
</div>
`;

class FluVaxCQL extends HTMLElement{
   constructor(){
     super();
     this.attachShadow({ mode: 'open'});
     this.shadowRoot.innerHTML = template;
   }

   connectedCallback() {
     function rotateImages(elem, selector) {
       selector = selector || 'img';
       const regex = new RegExp('[0-9]+:[0-9]+:[a-zA-Z]+$');
       var img = elem.querySelector(selector);

       if (img) {
         if (img && regex.test(img.alt)) {
           var n = img.alt.search(regex);
           var filename = img.alt.slice(0, n);
           var start, end, ext;
           [start, end, ext] = img.alt.slice(n, 9999).split(':');

           var tweens = [];
           for (var i = Number(start); i <= Number(end); i++) {
             tweens.push({method: 'set', props: {attr: {src: filename + String(i) + '.' + ext}}});
             tweens.push({method: 'to', props: {autoAlpha:1, duration: 0.75}});
             tweens.push({method: 'to', props: {autoAlpha:0, duration: 0.75, delay: 1.5}});
           }

           var tl = gsap.timeline({repeat: -1});
           tweens.forEach(function (item) {
             tl[item.method](img, item.props);
           });

           gsap.set(img, {attr: {src: filename + String(i) + '.' + ext}});
           gsap.to(img, {autoAlpha:1, duration: 0.75});
         }
         img.alt = ''
       }
     }

     function animateFrom(elem, direction) {
       direction = direction || 1;
       var x = 0,
           y = direction * 100;
       if(elem.classList.contains("reveal_left")) {
         x = -100;
         y = 0;
       } else if (elem.classList.contains("reveal_right")) {
         x = 100;
         y = 0;
       }
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
       rotateImages(elem)
     }

     function hide(elem) {
       gsap.set(elem, {autoAlpha: 0});
     }

     gsap.registerPlugin(ScrollTrigger);

     self = this;
     this.shadowRoot.querySelectorAll(".reveal").forEach(function(elem) {
       hide(elem); // assure that the element is hidden when scrolled into view

       ScrollTrigger.create({
         trigger: elem,
         onEnter: function() { animateFrom(elem) },
         onEnterBack: function() { animateFrom(elem, -1) },
         onLeave: function() { hide(elem) } // assure that the element is hidden when scrolled into view
       });

       rotateImages(self.shadowRoot, '#definitions');
   });
 }

}
window.customElements.define('flu-vax-cql', FluVaxCQL);
