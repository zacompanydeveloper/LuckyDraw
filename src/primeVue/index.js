import { definePreset } from "@primeuix/themes";
import { app } from "@/app_root.js";


import { 
  InputNumber,
  InputText,
  InputIcon,
  IconField,
  FloatLabel,
  Select,
  Breadcrumb,
  InputMask,
  InputOtp,
  Toast,
  AutoComplete,
} from "primevue";

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ColumnGroup from 'primevue/columngroup';   // optional
import Row from 'primevue/row';                   // optional
import Tooltip from 'primevue/tooltip';
import Dialog from 'primevue/dialog';

import Aura from "@primeuix/themes/aura";
import PrimeVue from "primevue/config";
import Button from "primevue/button";
import ToastService from 'primevue/toastservice';
import KeyFilter from 'primevue/keyfilter';

const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: "{blue.50}",
      100: "{blue.100}",
      200: "{blue.200}",
      300: "{blue.300}",
      400: "{blue.400}",
      500: "{blue.500}",
      600: "{blue.600}",
      700: "{blue.700}",
      800: "{blue.800}",
      900: "{blue.900}",
      950: "{blue.950}",
    },
  },
});

app.use(PrimeVue, {
  theme: {
    preset: MyPreset,
    options: {
      prefix: "p",
      darkModeSelector: "light",
      cssLayer: false,
    },
  },
});

app.use(ToastService);

app.component("IconField", IconField);
app.component("InputIcon", InputIcon);
app.component("InputText", InputText);
app.component("Button", Button);
app.component("InputNumber", InputNumber);
app.component("FloatLabel", FloatLabel);
app.component("Select", Select);
app.component("Breadcrumb", Breadcrumb);
app.component("InputMask", InputMask);
app.component("InputOtp", InputOtp);
app.component("Toast", Toast);
app.directive('keyfilter', KeyFilter);
app.component("AutoComplete", AutoComplete);
app.component('DataTable', DataTable);
app.component('Column', Column);
app.component('ColumnGroup', ColumnGroup);
app.component('Row', Row);
app.directive('tooltip', Tooltip);
app.component('Dialog', Dialog);
