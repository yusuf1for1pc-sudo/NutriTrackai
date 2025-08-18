import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the function
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the user from the request
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse the request body
    const { image, extraText } = await req.json()

    if (!image) {
      return new Response(
        JSON.stringify({ error: 'Image is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Call Gemini API
    const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('GEMINI_API_KEY')}`,
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: `Analyze this food image and provide nutrition information in the following JSON format only:

{
  "food_name": "Name of the food item",
  "calories": number,
  "carbs": number,
  "protein": number,
  "fat": number
}

${extraText ? `Additional context: ${extraText}` : ''}

Please be as accurate as possible with the nutrition values. If you cannot determine exact values, provide reasonable estimates based on typical serving sizes. Return only the JSON object, no additional text.`
            },
            {
              inline_data: {
                mime_type: image.mimeType || 'image/jpeg',
                data: image.data
              }
            }
          ]
        }]
      })
    })

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.statusText}`)
    }

    const geminiData = await geminiResponse.json()
    const responseText = geminiData.candidates[0].content.parts[0].text

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No valid JSON response from AI')
    }

    const analysis = JSON.parse(jsonMatch[0])

    // Validate the response structure
    if (!analysis.food_name || typeof analysis.calories !== 'number') {
      throw new Error('Invalid response structure from AI')
    }

    // Insert meal record into Supabase
    const mealData = {
      user_id: user.id,
      meal_name: analysis.food_name,
      food_name: analysis.food_name,
      calories: Math.round(analysis.calories),
      carbs: Math.round(analysis.carbs || 0),
      protein: Math.round(analysis.protein || 0),
      fat: Math.round(analysis.fat || 0),
      source: 'ai',
      meal_time: new Date().toISOString(),
      timestamp: new Date().toISOString(),
    }

    const { data: meal, error: mealError } = await supabaseClient
      .from('meals')
      .insert(mealData)
      .select()
      .single()

    if (mealError) {
      throw new Error(`Failed to save meal: ${mealError.message}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        meal,
        analysis: {
          food_name: analysis.food_name,
          calories: Math.round(analysis.calories),
          carbs: Math.round(analysis.carbs || 0),
          protein: Math.round(analysis.protein || 0),
          fat: Math.round(analysis.fat || 0),
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
