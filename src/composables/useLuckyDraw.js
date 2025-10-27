import { ref } from "vue";
import { useToast } from "primevue/usetoast";
import backend from "@/api/backend";

export function useLuckyDraw() {
  const toast = useToast();
  const virtualPrizes = ref([]);
  const virtualCustomers = ref([]);

  const fetchPrizes = async () => {
    try {
      const response = await backend.get("/lucky-draw-prizes/active-prizes");
      const prizesData = response.data?.data;
      if (Array.isArray(prizesData) && prizesData.length) {
        virtualPrizes.value = prizesData.map((p) => ({
          hash_id: p.id,
          name: p.name,
          image: p.image?.url,
        }));
      } else {
        toast.add({
          severity: "warn",
          summary: "No Prizes",
          detail: "No prizes available",
          life: 5000,
        });
      }
    } catch (err) {
      console.error("Error fetching prizes:", err);
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "Failed to fetch prizes",
        life: 5000,
      });
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await backend.get("/lucky-draw-tickets/customers");
      const customersData = response.data?.data;
      if (Array.isArray(customersData) && customersData.length) {
        virtualCustomers.value = customersData.map((c) => ({
          hash_id: c.id,
          name: c.customer_name,
          phone: c.phone,
          shop_name: c.shop_name,
          township: c.township,
        }));
      } else {
        toast.add({
          severity: "warn",
          summary: "No Customers",
          detail: "No customers available",
          life: 5000,
        });
        virtualCustomers.value = [];
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "Failed to fetch customers",
        life: 5000,
      });
    }
  };

  const shufflePrize = async () => {
    try {
      const res = await backend.get("/lucky-draw-prizes/shuffle-prize");
      return res.data?.data ?? null;
    } catch (err) {
      return null;
    }
  };

  const shuffleCustomer = async (prizeId) => {
    try {
      const res = await backend.get("/lucky-draw-tickets/shuffle-customer", {
        params: { prize_id: prizeId },
      });
      return {
        hash_id: res.data?.data?.id ?? null,
        name: res.data?.data?.customer_name ?? null,
        phone: res.data?.data?.phone ?? null,
        shop_name: res.data?.data?.shop_name ?? null,
        township: res.data?.data?.township ?? null,
        nrc: res.data?.data?.nrc ?? null,
        shop_township: res.data?.data?.shop_township ?? null,
      };
    } catch (err) {
      console.error("Failed to fetch real customer", err);
        return null;
    }
  };

  return {
    virtualPrizes,
    virtualCustomers,
    fetchPrizes,
    fetchCustomers,
    shufflePrize,
    shuffleCustomer,
  };
}
