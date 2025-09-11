import { checkPermission } from '@/helper/permissions.js';

export default {
  mounted(el, binding) {
    // binding.value is the permission string
    const hasPermission = checkPermission(binding.value);

    // If no permission, remove the element completely
    if (!hasPermission) {
      el.parentNode && el.parentNode.removeChild(el);
    }
  },
  updated(el, binding) {
    // In case permissions change dynamically
    const hasPermission = checkPermission(binding.value);
    if (!hasPermission) {
      el.parentNode && el.parentNode.removeChild(el);
    }
  }
};
