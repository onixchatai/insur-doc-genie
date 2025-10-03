import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrls } = await req.json();
    console.log('Analyzing images:', imageUrls);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth token from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const results = [];

    // Analyze each image
    for (const imageUrl of imageUrls) {
      console.log('Analyzing image:', imageUrl);

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'system',
              content: 'You are an expert at analyzing items for insurance documentation. Extract detailed information from images of household items.'
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Analyze this item and provide: name, description, category (electronics, furniture, clothing, toys, appliances, other), estimated_value (numeric only), condition (excellent, good, fair, poor), brand (if visible), model (if visible), color.'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageUrl
                  }
                }
              ]
            }
          ],
          tools: [
            {
              type: 'function',
              function: {
                name: 'extract_item_details',
                description: 'Extract structured details about the item',
                parameters: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    description: { type: 'string' },
                    category: { type: 'string', enum: ['electronics', 'furniture', 'clothing', 'toys', 'appliances', 'other'] },
                    estimated_value: { type: 'number' },
                    condition: { type: 'string', enum: ['excellent', 'good', 'fair', 'poor'] },
                    brand: { type: 'string' },
                    model: { type: 'string' },
                    color: { type: 'string' }
                  },
                  required: ['name', 'description', 'category', 'estimated_value', 'condition'],
                  additionalProperties: false
                }
              }
            }
          ],
          tool_choice: { type: 'function', function: { name: 'extract_item_details' } }
        }),
      });

      if (!response.ok) {
        console.error('AI gateway error:', response.status, await response.text());
        throw new Error('AI analysis failed');
      }

      const data = await response.json();
      const toolCall = data.choices[0].message.tool_calls?.[0];
      
      if (toolCall) {
        const itemDetails = JSON.parse(toolCall.function.arguments);
        console.log('Extracted details:', itemDetails);

        // Save to database
        const { data: item, error: insertError } = await supabase
          .from('inventory_items')
          .insert({
            user_id: user.id,
            name: itemDetails.name,
            description: itemDetails.description,
            category: itemDetails.category,
            estimated_value: itemDetails.estimated_value,
            condition: itemDetails.condition,
            brand: itemDetails.brand || null,
            model: itemDetails.model || null,
            color: itemDetails.color || null,
            image_url: imageUrl
          })
          .select()
          .single();

        if (insertError) {
          console.error('Insert error:', insertError);
          throw insertError;
        }

        results.push(item);
      }
    }

    return new Response(
      JSON.stringify({ success: true, items: results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in analyze-items:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
