export interface Dish {
  id: string;
  created_at: string;
  name: string;
  photo_uri?: string | null;
  user_id: string;
  latitude?: number | null;
  longitude?: number | null;
  city?: string | null;
  country?: string | null;
}
