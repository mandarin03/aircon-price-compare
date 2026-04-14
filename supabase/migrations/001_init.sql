-- 에어컨 청소 가격 비교 - 초기 스키마
-- Supabase SQL Editor에서 실행

-- 1. 가격 데이터 테이블
CREATE TABLE price_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aircon_type TEXT NOT NULL CHECK (aircon_type IN ('wall-mount', 'standing', 'ceiling', 'system', 'window')),
  cleaning_method TEXT NOT NULL DEFAULT 'unknown' CHECK (cleaning_method IN ('general', 'disassembly', 'complete-disassembly', 'unknown')),
  region_city TEXT NOT NULL CHECK (region_city IN ('seoul', 'gyeonggi')),
  region_district TEXT NOT NULL,
  price INTEGER NOT NULL CHECK (price > 0),
  price_max INTEGER CHECK (price_max IS NULL OR price_max >= price),
  price_unit TEXT DEFAULT '1대 기준',
  included_services TEXT[] DEFAULT '{}',
  additional_services TEXT[] DEFAULT '{}',
  extra_charges JSONB DEFAULT '[]',
  provider_name TEXT NOT NULL,
  source_platform TEXT NOT NULL CHECK (source_platform IN ('soomgo', 'danggeun', 'blog', 'website', 'registration')),
  source_url TEXT NOT NULL,
  is_incomplete BOOLEAN DEFAULT false,
  incomplete_fields JSONB DEFAULT '[]',
  collected_at TIMESTAMPTZ DEFAULT now(),
  verified_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. 크롤링 로그 테이블
CREATE TABLE crawl_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_platform TEXT NOT NULL,
  target_url TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'success', 'failed', 'partial')),
  entries_found INTEGER DEFAULT 0,
  entries_saved INTEGER DEFAULT 0,
  entries_updated INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. 정규화 전 원본 크롤링 데이터
CREATE TABLE raw_crawl_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crawl_log_id UUID REFERENCES crawl_logs(id),
  source_platform TEXT NOT NULL,
  source_url TEXT NOT NULL,
  raw_text TEXT,
  parsed_fields JSONB DEFAULT '{}',
  normalization_status TEXT DEFAULT 'pending' CHECK (normalization_status IN ('pending', 'completed', 'failed', 'manual-review')),
  normalized_entry_id UUID REFERENCES price_entries(id),
  crawled_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_entries_region ON price_entries(region_city, region_district);
CREATE INDEX idx_entries_type ON price_entries(aircon_type);
CREATE INDEX idx_entries_active ON price_entries(is_active) WHERE is_active = true;
CREATE INDEX idx_entries_source ON price_entries(source_platform);
CREATE INDEX idx_entries_source_url ON price_entries(source_url);
CREATE INDEX idx_crawl_logs_status ON crawl_logs(status);
CREATE INDEX idx_raw_data_status ON raw_crawl_data(normalization_status);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER price_entries_updated_at
  BEFORE UPDATE ON price_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS (Row Level Security) - 읽기만 공개
ALTER TABLE price_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON price_entries FOR SELECT USING (true);
CREATE POLICY "Service role write" ON price_entries FOR ALL USING (auth.role() = 'service_role');

ALTER TABLE crawl_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON crawl_logs FOR ALL USING (auth.role() = 'service_role');

ALTER TABLE raw_crawl_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON raw_crawl_data FOR ALL USING (auth.role() = 'service_role');
