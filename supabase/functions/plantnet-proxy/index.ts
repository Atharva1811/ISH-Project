// Supabase Edge Function: plantnet-proxy
// Location: supabase/functions/plantnet-proxy/index.ts
// Secure Proxy for PlantNet AI API with JWT Authentication

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  // Handle CORS preflight options request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. JWT Authentication Verification
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Missing or invalid Authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Invalid or expired JWT session token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Fetch PlantNet API Key from Secret Store
    const plantnetApiKey = Deno.env.get("PLANTNET_API_KEY");
    if (!plantnetApiKey) {
      return new Response(
        JSON.stringify({ error: "Server Configuration Error: PLANTNET_API_KEY secret not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Extract Image FormData from Request
    const formData = await req.formData();
    const imageFile = formData.get("images") || formData.get("image");

    if (!imageFile || !(imageFile instanceof File)) {
      return new Response(
        JSON.stringify({ error: "Bad Request: Expected 'images' file field in FormData" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Construct Multipart Request for PlantNet API
    const plantnetFormData = new FormData();
    plantnetFormData.append("images", imageFile);
    plantnetFormData.append("organs", "leaf"); // Default organ tag

    const plantnetUrl = `https://my-api.plantnet.org/v2/identify/all?api-key=${encodeURIComponent(plantnetApiKey)}&lang=en`;

    const plantnetResponse = await fetch(plantnetUrl, {
      method: "POST",
      body: plantnetFormData,
    });

    if (!plantnetResponse.ok) {
      const errorText = await plantnetResponse.text();
      return new Response(
        JSON.stringify({ 
          error: "PlantNet API Identification Failed", 
          status: plantnetResponse.status,
          details: errorText 
        }),
        { status: plantnetResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await plantnetResponse.json();

    // 5. Transform API response into standardized candidate format
    const predictions = (result.results || []).slice(0, 5).map((item: any) => ({
      speciesName: item.species?.scientificNameWithoutAuthor || item.species?.scientificName || "Unknown Species",
      commonName: item.species?.commonNames?.[0] || item.species?.scientificName || "Unknown Common Name",
      family: item.species?.family?.scientificNameWithoutAuthor || "Unknown Family",
      score: Math.round((item.score || 0) * 1000) / 10, // Convert float to percentage (e.g. 94.5%)
    }));

    return new Response(
      JSON.stringify({
        success: true,
        predictions,
        queryOrgans: result.query?.organs || ["leaf"],
        bestMatch: predictions[0] || null
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: "Internal Edge Function Error", message: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
