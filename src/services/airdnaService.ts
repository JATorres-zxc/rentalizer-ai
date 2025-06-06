
import { supabase } from '@/integrations/supabase/client';

interface SubmarketData {
  submarket: string;
  strRevenue: number;
  medianRent: number;
  multiple: number;
  neighborhood: string;
  address?: string;
}

export const fetchRealMarketData = async (city: string, propertyType: string, bathrooms: string) => {
  try {
    console.log(`🚀 Calling AirDNA API for ${city}`);
    
    const { data, error } = await supabase.functions.invoke('airdna-api', {
      body: {
        city,
        propertyType,
        bathrooms
      }
    });

    if (error) {
      throw new Error(`API call failed: ${error.message}`);
    }

    console.log('✅ AirDNA API response:', data);
    
    return data;
  } catch (error) {
    console.error('❌ AirDNA API error:', error);
    throw error;
  }
};

export const processMarketData = (marketData: any): SubmarketData[] => {
  const processedData: SubmarketData[] = [];
  
  console.log('🔍 Processing AirDNA market data:', marketData);
  
  // Handle successful API response with market data
  if (marketData && marketData.success && marketData.data) {
    const responseData = marketData.data;
    
    console.log(`📊 Processing AirDNA data from source: ${responseData.source}`);
    
    // Handle market performance data
    if (responseData.source === 'airdna_market_api' && responseData.marketData) {
      console.log('📈 Processing market performance data');
      const marketData = responseData.marketData;
      
      // Process market data by location/neighborhood if available
      if (marketData.results && Array.isArray(marketData.results)) {
        marketData.results.forEach((result: any) => {
          const neighborhood = result.neighborhood || result.location || result.area || 'City Average';
          const monthlyRevenue = result.revenue || result.monthly_revenue || (result.adr * result.occupancy_rate * 30) || 0;
          const estimatedRent = monthlyRevenue * 0.7; // Estimate traditional rent as 70% of STR revenue
          const multiple = estimatedRent > 0 ? monthlyRevenue / estimatedRent : 0;
          
          if (monthlyRevenue > 0) {
            processedData.push({
              submarket: `${neighborhood}, ${responseData.city}`,
              strRevenue: Math.round(monthlyRevenue),
              medianRent: Math.round(estimatedRent),
              multiple: multiple,
              neighborhood: neighborhood
            });
          }
        });
      }
    }
    
    // Handle property search data
    else if (responseData.source === 'airdna_property_search' && responseData.properties) {
      console.log('🏠 Processing property search data');
      const properties = responseData.properties;
      
      // Group properties by neighborhood and calculate averages
      const neighborhoodData = new Map();
      
      if (Array.isArray(properties)) {
        properties.forEach((property: any) => {
          const neighborhood = property.neighborhood || property.district || property.area || 'Unknown Area';
          const revenue = property.revenue || property.monthly_revenue || 0;
          const adr = property.adr || property.average_daily_rate || 0;
          const occupancy = property.occupancy_rate || property.occupancy || 0;
          
          // Calculate monthly revenue if we have ADR and occupancy
          let monthlyRevenue = revenue;
          if (!monthlyRevenue && adr > 0 && occupancy > 0) {
            monthlyRevenue = adr * (occupancy / 100) * 30; // Monthly estimate
          }
          
          if (!neighborhoodData.has(neighborhood)) {
            neighborhoodData.set(neighborhood, {
              revenues: [],
              count: 0
            });
          }
          
          const data = neighborhoodData.get(neighborhood);
          if (monthlyRevenue > 0) {
            data.revenues.push(monthlyRevenue);
            data.count++;
          }
        });
        
        // Calculate averages for each neighborhood
        neighborhoodData.forEach((data, neighborhood) => {
          if (data.revenues.length > 0) {
            const avgRevenue = data.revenues.reduce((sum: number, rev: number) => sum + rev, 0) / data.revenues.length;
            const estimatedRent = avgRevenue * 0.7; // Estimate traditional rent
            const multiple = estimatedRent > 0 ? avgRevenue / estimatedRent : 0;
            
            processedData.push({
              submarket: `${neighborhood}, ${responseData.city}`,
              strRevenue: Math.round(avgRevenue),
              medianRent: Math.round(estimatedRent),
              multiple: multiple,
              neighborhood: neighborhood
            });
          }
        });
      }
    }
  }
  
  // Handle API failure or no data
  if (processedData.length === 0) {
    console.log('❌ No valid market data found from AirDNA');
    
    const city = marketData?.data?.city || 'Unknown City';
    const message = marketData?.data?.message || marketData?.data?.error || 'No market data available';
    
    processedData.push({
      submarket: `${city} - ${message}`,
      strRevenue: 0,
      medianRent: 0,
      multiple: 0,
      neighborhood: city
    });
  }

  // Sort by STR revenue (highest first)
  processedData.sort((a, b) => b.strRevenue - a.strRevenue);

  console.log('✅ Processed AirDNA market data:', processedData.map(d => ({
    neighborhood: d.neighborhood,
    monthlyRevenue: d.strRevenue,
    estimatedRent: d.medianRent,
    multiple: d.multiple > 0 ? d.multiple.toFixed(2) : 'N/A'
  })));
  
  return processedData;
};
