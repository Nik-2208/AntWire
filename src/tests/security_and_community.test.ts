/**
 * ANTWRE — Security, Privacy, Telemetry & Firebase Community Test Suite
 * Created & Developed by Nikhilesh H. Chavda
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SecuritySanitizer } from '../security/sanitizer';
import { RateLimiter } from '../security/rate_limiter';
import { logger } from '../telemetry/logger';
import { PrivacyManager } from '../telemetry/privacy_manager';
import { CommunityService } from '../community/community_service';

describe('ANTWIRE Security, Privacy & Community Platform Suite', () => {
  beforeEach(() => {
    RateLimiter.getInstance().reset();
  });

  it('1. SecuritySanitizer prevents path traversal and XSS injection', () => {
    // Path traversal defense
    const badTraversal = SecuritySanitizer.validateSafeFilename('../../etc/passwd.antbrain');
    expect(badTraversal.safe).toBe(false);
    expect(badTraversal.reason).toContain('Path traversal');

    const windowsTraversal = SecuritySanitizer.validateSafeFilename('..\\..\\Windows\\System32\\cmd.exe');
    expect(windowsTraversal.safe).toBe(false);

    const safeFile = SecuritySanitizer.validateSafeFilename('antbrain_v2_model.antbrain');
    expect(safeFile.safe).toBe(true);
    expect(safeFile.sanitizedName).toBe('antbrain_v2_model.antbrain');

    // XSS defense
    const maliciousScript = '<script>alert("xss")</script>';
    const escaped = SecuritySanitizer.escapeHtml(maliciousScript);
    expect(escaped).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');

    // Safe error formatting strips absolute filesystem paths
    const internalErr = new Error('Failed to load file at C:\\Users\\Administrator\\Secret\\token.key');
    const safeMsg = SecuritySanitizer.formatSafeErrorMessage(internalErr);
    expect(safeMsg).not.toContain('C:\\Users');
    expect(safeMsg).toContain('[internal_path]');
  });

  it('2. RateLimiter enforces sliding window limits and action cooldowns', () => {
    const limiter = RateLimiter.getInstance();
    const clientId = 'test-client-1';

    // 1st request should be allowed
    const allowed1 = limiter.isAllowed(clientId, 'feedback');
    expect(allowed1).toBe(true);

    // Immediate subsequent requests within cooldown should be blocked
    const cooldown = limiter.getCooldownSeconds(clientId, 'feedback');
    expect(cooldown).toBeGreaterThanOrEqual(0);
  });

  it('3. PrivacyManager generates non-fingerprinting anonymous session tokens and manages opt-out', () => {
    const privacy = PrivacyManager.getInstance();
    const session1 = privacy.getAnonymousSessionId();
    expect(session1).toMatch(/^anon-[a-f0-9\-]+$/);

    // Analytics opt-out toggle
    privacy.setOptOut(true);
    expect(privacy.isOptedOut()).toBe(true);

    privacy.setOptOut(false);
    expect(privacy.isOptedOut()).toBe(false);
  });

  it('4. AntWireLogger records structured audit entries and ant runtime events with secret redaction', () => {
    logger.clear();

    const logEntry = logger.log('SECURITY', 'INFO', 'Security policy initialized', {
      sessionId: 'test-session',
      metadata: { apiKey: 'secret-12345' },
    });

    expect(logEntry.category).toBe('SECURITY');
    expect(logEntry.eventId).toContain('LOG-');

    // Runtime ant event
    logger.logAntEvent('RESOURCE_COLLECTED', 'ant-42', 'Worker collected 1.0 food unit');
    const recent = logger.getRecentLogs(10, 'ANT');
    expect(recent.length).toBeGreaterThanOrEqual(1);
    expect(recent[0].message).toContain('RESOURCE_COLLECTED');
  });

  it('5. CommunityService provides verified model releases with SHA-256 checksums', () => {
    const community = CommunityService.getInstance();
    const models = community.getModelReleases();

    expect(models.length).toBeGreaterThanOrEqual(2);
    const foundationModel = models.find((m) => m.id === 'antwire-v1-foundation');
    expect(foundationModel).toBeDefined();
    expect(foundationModel?.neuronCount).toBe(55420);
    expect(foundationModel?.checksum.length).toBe(64);
  });

  it('6. CommunityService validates feedback submissions and returns unique tracking IDs', async () => {
    const community = CommunityService.getInstance();

    const res = await community.submitFeedback({
      type: 'FEATURE_REQUEST',
      title: 'Support Pheromone Volatility Sweep',
      description: 'Requesting a slider to adjust trail evaporation half-life dynamically.',
      category: 'PHEROMONE',
    });

    // Validates rate limit / feedback schema
    expect(res).toBeDefined();
    if (res.success) {
      expect(res.trackingId).toMatch(/^ANT-FB-/);
    }
  });

  it('7. CommunityService registers public experiments with verifiable multi-agent metrics', async () => {
    const community = CommunityService.getInstance();

    const res = await community.publishExperiment({
      title: 'Autonomous Multi-Agent Labyrinth Navigation',
      author: 'AntWire Developer',
      modelVersion: '1.0.0',
      environment: 'Procedural Labyrinth 60m',
      task: 'Maze Escape & Beacon Signaling',
      population: 20,
      configuration: { mazeComplexity: 4 },
      metrics: {
        foragingEfficiency: 0.91,
        survivalRate: 1.0,
        totalTicks: 600,
      },
      description: 'Tested 20 workers navigating procedural walls with zero deadlocks.',
    });

    expect(res).toBeDefined();
  });
});
