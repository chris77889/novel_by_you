-- SQL 语句以更新 Supabase 数据库结构
-- 在 Supabase 控制台的 SQL 编辑器中执行以下语句：

-- 向 reading_histories 表添加 structure_outline 列
ALTER TABLE reading_histories
ADD COLUMN structure_outline TEXT DEFAULT NULL;

-- 更新现有记录的 structure_outline 字段（可选操作）
-- UPDATE reading_histories
-- SET structure_outline = '这是一个默认的故事结构大纲。';

-- 重建索引（如果需要）
-- REINDEX TABLE reading_histories; 