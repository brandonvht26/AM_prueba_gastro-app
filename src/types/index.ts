export interface Dish {
  id: string;
  created_at: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  user_id: string;
  latitude?: number | null;
  longitude?: number | null;
}
