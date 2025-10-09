-- ============================================
-- Tabela de Preferências do Usuário
-- ============================================

CREATE TABLE user_preferences (
    id SERIAL PRIMARY KEY,
    preference_key VARCHAR(100) NOT NULL UNIQUE,
    preference_value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índice para busca rápida
CREATE INDEX idx_preferences_key ON user_preferences(preference_key);

-- Inserir preferência padrão de IA
INSERT INTO user_preferences (preference_key, preference_value) 
VALUES ('preferred_ai', 'gemini')
ON CONFLICT (preference_key) DO NOTHING;
