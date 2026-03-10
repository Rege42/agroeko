import { createRouter, createWebHistory } from "vue-router";
import Forecasting from "../components/analytics/forecast/Forecasting.vue";
import ForecastForm from "../components/analytics/forecast/ForecastForm.vue";
import ForecastResult from "../components/analytics/forecast/ForecastResult.vue";
import Reports from "../components/analytics/reports/Reports.vue";
import ReportForm from "../components/analytics/reports/ReportForm.vue";
import ReportResult from "../components/analytics/reports/ReportResult.vue";
import Indicators from "../components/analytics/indicators/Indicators.vue";
import IndicatorShowcase from "../components/analytics/indicators/IndicatorShowcase.vue";
import FieldsList from "../components/crop-rotation/add-field/FieldsList.vue";
import FieldForm from "../components/crop-rotation/add-field/FieldForm.vue";
import AgroPlan from "../components/crop-rotation/agrotechnical-plan/AgroPlan.vue";
import CropsCompatibility from "../components/crop-rotation/crops-compability/CropsCompatibility.vue";
import CropSelection from "../components/crop-rotation/crops-compability/CropSelection.vue";
import CropSelectionForm from "../components/crop-rotation/crops-compability/CropSelectionForm.vue";
import CropsHistory from "../components/crop-rotation/crops-history/CropsHistory.vue";
import FieldHistory from "../components/crop-rotation/crops-history/FieldHistory.vue";
import FieldEdit from "../components/crop-rotation/add-field/FieldEdit.vue";
import AddCropsHistoryForm from "../components/crop-rotation/crops-history/AddCropsHistoryForm.vue";
import LoginView from "../components/views/LoginView.vue";
import { isAuthenticated } from "../services/authService";

const routes = [
    {
    path: "/",
    redirect: "/forecast",
  },
  {
    path: "/forecast",
    name: "Forecasting",
    component: Forecasting,
    meta: { requiresAuth: true },
  },
  {
    path: "/forecast/yield",
    name: "ForecastForm",
    component: ForecastForm,
    meta: { requiresAuth: true },
  },
  {
    path: "/forecast/yield/result",
    name: "ForecastResult",
    component: ForecastResult,
    meta: { requiresAuth: true },
  },
  { 
    path: "/reports", 
    name: "Reports", 
    component: Reports, 
    meta: { requiresAuth: true } 
  },
  { path: "/reports/new",
    name: "ReportForm", 
    component: ReportForm, 
    meta: { requiresAuth: true } 
  },
  { path: "/reports/result", 
    name: "ReportResult", 
    component: ReportResult, 
    meta: { requiresAuth: true } 
  },
  {
    path: "/indicators",
    name: "Indicators",
    component: Indicators,
    meta: { requiresAuth: true },
  },
  {
    path: "/indicators/:id",
    name: "IndicatorShowcase",
    component: IndicatorShowcase,
    meta: { requiresAuth: true },
  },
  {
    path: "/crop-rotation/fields",
    name: "FieldsList",
    component: FieldsList,
    meta: { requiresAuth: true },
  },
  {
    path: "/crop-rotation/fields/new",
    name: "FieldForm",
    component: FieldForm,
    meta: { requiresAuth: true },
  },
  {
    path: "/crop-rotation/fields/:id",
    name: "FieldEdit",
    component: FieldEdit,
    meta: { requiresAuth: true },
  },
  {
    path: "/crop-rotation/agroplan",
    name: "AgroPlan",
    component: AgroPlan,
    meta: { requiresAuth: true },
  },
  {
    path: "/crop-rotation/compatibility",
    name: "CropsCompatibility",
    component: CropsCompatibility,
    meta: { requiresAuth: true },
  },
  {
    path: "/crop-rotation/crop-selection",
    name: "CropSelection",
    component: CropSelection,
    meta: { requiresAuth: true },
  },
  {
    path: "/crop-rotation/crop-selection/new",
    name: "CropSelectionForm",
    component: CropSelectionForm,
    meta: { requiresAuth: true },
  },
  {
    path: "/crop-rotation/history",
    name: "CropsHistory",
    component: CropsHistory,
    meta: { requiresAuth: true },
  },
  {
    path: "/crop-rotation/history/:fieldId",
    name: "FieldHistory",
    component: FieldHistory,
    meta: { requiresAuth: true },
    children: [
      {
        path: "add",
        name: "CropRotationAdd",
        component: AddCropsHistoryForm,
        meta: { requiresAuth: true },
      },
      {
        path: "edit/:entryId",
        name: "CropRotationEdit",
        component: AddCropsHistoryForm,
        meta: { requiresAuth: true },
      },
    ],
  },
  {
    path: "/crop-rotation/history/:fieldId/add",
    name: "CropRotationAdd",
    component: AddCropsHistoryForm,
    meta: { requiresAuth: true },
  },
  {
    path: "/crop-rotation/history/:fieldId/edit/:entryId",
    name: "CropRotationEdit",
    component: AddCropsHistoryForm,
    meta: { requiresAuth: true },
  },
  {
    path: "/login",
    component: LoginView,
    meta: { hideSidebar: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next("/login");
  } else {
    next();
  }
});

export default router;
