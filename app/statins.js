function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}

drugs = {
  atorvastatin: {
    brand: 'Lipitor',
    howSupp: [10, 20, 40],
    convFact: [0.5, 0.5],
    img: 'https://www.lipitor.com/-/media/project/common/lipitorcom/images/lipitor-atorvastatin-calcium-logo.jpg?h=70&iar=0&w=280&hash=1865BF51419E873BB6982C1B1D86D9E8'
  },
  fluvastatin: {
    brand: 'Lescol',
    howSupp: [20, 40, 80],
    convFact: [4, 4]
  },
  lovastatin: {
    brand: 'Mevacor',
    howSupp: [10, 20, 40, 80],
    convFact: [2, 2]
  },
  pravastatin: {
    brand: 'Pravacol',
    howSupp: [10, 20, 40, 80],
    convFact: [2, 2]
  },
  rosuvastatin: {
    brand: 'Crestor',
    howSupp: [5, 10, 20],
    convFact: [0.125, 0.25],
    img: 'https://www.crestor.com/content/dam/website-services/us/341-crestordtc-com/images/crestor-rosuvastatin-calcium.png'
  },
  simvastatin: {
    brand: 'Zocor',
    howSupp: [5, 10, 20, 40, 80],
    convFact: [1, 1],
    img: 'https://www.sec.gov/Archives/edgar/data/64978/000095012302011676/y66526y66526az0005.gif'
  }
};

drugOptions = []
Object.keys(drugs).forEach(function(key) {
  drugOptions.push({
    key: key,
    label: toTitleCase(key),
    value: key
  });
});

CustomEl = {
    data () {
      return {
        drugOptions: drugOptions,
        drugSelected: drugOptions[5].value,
        strengthOptions: drugs[drugOptions[5].value].howSupp,
        strengthSelected: drugs[drugOptions[5].value].howSupp[0],
        results: []
      }
    },
    props: {
      css: { 
        type: String,
        default: '//unpkg.com/element-plus/dist/index.css'
      }
    },
    components: {
      'el-select': ElementPlus.ElSelect,
      'el-option': ElementPlus.ElOption,
      'el-row': ElementPlus.ElRow,
      'el-col': ElementPlus.ElCol,
      'el-result': ElementPlus.ElResult,
      'el-image': ElementPlus.ElImage
    },
    template: `<div>
      <el-select v-model="drugSelected" @change="drugChanged">
        <el-option v-for="item in drugOptions" :key="item.key" :label="item.label" :value="item.value"></el-option>
      </el-select>
      <el-select v-model="strengthSelected" @change="strengthChanged">
        <el-option v-for="item in strengthOptions" :key="item" :label="item" :value="item"></el-option>
      </el-select> mg
      <el-row>
        <el-col :sm="12" :lg="6" v-for="item in results">
          <el-result :title="item.drug"
            :sub-title="item.brand"
          >
            <template #icon>
              <el-image
                :src="item.img"
              v-if="item.img"></el-image>
            </template>
            <template #extra>
              <span>{{item.strength}}</span>
            </template>
          </el-result>
        </el-col>
      </el-row>
    </div>`,
    methods: {
      drugChanged(val) {
        this.strengthOptions = drugs[val].howSupp;
        this.strengthSelected = drugs[val].howSupp[0];
        this.strengthChanged(this.strengthSelected);
      },
      strengthChanged(val) {
        var self = this;
        var results = [];
        var minVal = val/drugs[this.drugSelected].convFact[1];
        var maxVal = val/drugs[this.drugSelected].convFact[0];

        Object.keys(drugs).forEach(function(key) {
          var drug = drugs[key];
          var min = minVal * drug.convFact[0];
          min = (drug.howSupp[0] <= min && min <= drug.howSupp[drug.howSupp.length - 1]) ? min : 'N/A';
          var max = maxVal * drug.convFact[1];
          max = (drug.howSupp[0] <= max && max <= drug.howSupp[drug.howSupp.length - 1]) ? max : 'N/A';

          if (min == max) {
            var strength = min;
          } else if (min == 'N/A') {
            var strength = max;
          } else if (max == 'N/A') {
            var strength = min;
          } else {
            var strength = String(min) + '-' + String(max);
          }

          if (key == self.drugSelected) {
            strength = val;
          }

          if (strength != 'N/A') {
            strength += ' mg'
          }

          results.push({
            drug: key,
            brand: drug.brand,
            img: drug.img,
            max: max,
            min: min,
            strength: strength
          });
        });

        this.results = results;
      }
    },
    mounted() {
      var self = this;
      var ss = document.styleSheets;
      for (i = 0; i < ss.length; i ++) {
        href = ss[i].href;
        const linkElem = document.createElement('link');
        linkElem.setAttribute('rel', 'stylesheet');
        linkElem.setAttribute('href', href);
        self.$el.appendChild(linkElem);
      }
      this.strengthChanged(this.strengthSelected);
    }
}

customEl = Vue.defineCustomElement(CustomEl)
customElements.define('my-vue-element', customEl, {shadow: false})
