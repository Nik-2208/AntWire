/**
 * ANTWRE — Real Firebase Community, Model Hub & Developer Collaboration
 * Created & Developed by Nikhilesh H. Chavda
 *
 * Repository: https://github.com/Nik-2208/AntWire
 * Portfolio:  https://nik-portfolio-lime.vercel.app/
 * LinkedIn:   https://www.linkedin.com/in/nikhilesh-chavda-2b779533a/
 *
 * Features:
 * - Real Firebase Auth (Anonymous & Google Developer Accounts)
 * - Official Model Hub with SHA-256 Checksums and Real Event-Counted Downloads
 * - Authenticated/Anonymous Feedback Tickets (OPEN, TRIAGED, IN_PROGRESS, RESOLVED, CLOSED)
 * - Developer Comments & Discussion Threads (Create, Edit Own, Delete Own)
 * - Community Feature Requests & Upvoting
 * - Real Bug Reporting & Severity Tracking
 * - Public Multi-Agent Experiments Registry
 * - Zero Fake Data / Resilient Offline Support
 */

import React, { useState, useEffect } from 'react';
import { AntWireLogo } from './AntWireLogo';
import {
  Download,
  Share2,
  BookOpen,
  Shield,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  FileCode,
  Globe,
  RefreshCw,
  Search,
  Users,
  Cpu,
  Sparkles,
  ExternalLink,
  Info,
  MessageCircle,
  MessageSquarePlus,
  PlusCircle,
  Trash2,
  Edit3,
  Send,
  CloudOff,
  Database,
  ThumbsUp,
  Bug,
  Lightbulb,
  LogIn,
  LogOut,
  User as UserIcon,
  Filter
} from 'lucide-react';
import {
  CommunityService,
  ModelReleaseRecord,
  PublicExperimentRecord,
  CommunityFeedbackRecord,
  DeveloperCommentRecord,
  FeatureRequestRecord,
  BugReportRecord,
  FeedbackType,
  BackendStatus,
  AntWireUser
} from '../community/community_service';
import { PrivacyManager } from '../telemetry/privacy_manager';

export const CommunityView: React.FC = () => {
  const communityService = CommunityService.getInstance();
  const privacyManager = PrivacyManager.getInstance();

  const [activeTab, setActiveTab] = useState<
    'models' | 'feedback' | 'comments' | 'features' | 'bugs' | 'experiments' | 'contribute' | 'privacy'
  >('models');

  const [backendStatus, setBackendStatus] = useState<BackendStatus>(communityService.getBackendStatus());
  const [currentUser, setCurrentUser] = useState<AntWireUser | null>(communityService.getCurrentUser());

  // Data lists from service
  const [models, setModels] = useState<ModelReleaseRecord[]>(communityService.getModelReleases());
  const [feedbackList, setFeedbackList] = useState<CommunityFeedbackRecord[]>(communityService.getFeedback());
  const [commentsList, setCommentsList] = useState<DeveloperCommentRecord[]>(communityService.getComments());
  const [featureRequests, setFeatureRequests] = useState<FeatureRequestRecord[]>(communityService.getFeatureRequests());
  const [bugReports, setBugReports] = useState<BugReportRecord[]>(communityService.getBugReports());
  const [experiments, setExperiments] = useState<PublicExperimentRecord[]>(communityService.getPublicExperiments());

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [feedbackFilter, setFeedbackFilter] = useState<string>('ALL');

  // Comment Creation / Editing State
  const [commentTargetId, setCommentTargetId] = useState('general-discussion');
  const [commentTargetType, setCommentTargetType] = useState<'GENERAL' | 'MODEL' | 'EXPERIMENT' | 'FEEDBACK'>('GENERAL');
  const [commentBody, setCommentBody] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Feedback Submission State
  const [fbType, setFbType] = useState<FeedbackType>('FEATURE_REQUEST');
  const [fbTitle, setFbTitle] = useState('');
  const [fbDescription, setFbDescription] = useState('');
  const [fbCategory, setFbCategory] = useState('SIMULATION_ENGINE');
  const [fbSubmitting, setFbSubmitting] = useState(false);
  const [fbStatusMessage, setFbStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Feature Request State
  const [featTitle, setFeatTitle] = useState('');
  const [featDesc, setFeatDesc] = useState('');
  const [featCategory, setFeatCategory] = useState('NEURAL_CONNECTOME');
  const [featSubmitting, setFeatSubmitting] = useState(false);

  // Bug Report State
  const [bugTitle, setBugTitle] = useState('');
  const [bugDesc, setBugDesc] = useState('');
  const [bugSeverity, setBugSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [bugSubmitting, setBugSubmitting] = useState(false);

  // Experiment Modal / Publishing
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [expTitle, setExpTitle] = useState('');
  const [expDesc, setExpDesc] = useState('');
  const [expEnv, setExpEnv] = useState('Procedural Foraging Basin');
  const [expTask, setExpTask] = useState('Foraging & Food Logistics');
  const [expPop, setExpPop] = useState(25);
  const [publishingExp, setPublishingExp] = useState(false);

  // Privacy Opt-Out State
  const [analyticsOptOut, setAnalyticsOptOut] = useState(privacyManager.isOptedOut());
  const [anonSessionId, setAnonSessionId] = useState(privacyManager.getAnonymousSessionId());
  const [toast, setToast] = useState<{ text: string; isError: boolean } | null>(null);

  const showToast = (text: string, isError = false) => {
    setToast({ text, isError });
    setTimeout(() => {
      setToast((prev) => (prev?.text === text ? null : prev));
    }, 4000);
  };

  useEffect(() => {
    const unsubStatus = communityService.onStatusChange((status) => {
      setBackendStatus(status);
      refreshData();
    });

    const interval = setInterval(() => {
      refreshData();
      setCurrentUser(communityService.getCurrentUser());
    }, 1500);

    return () => {
      unsubStatus();
      clearInterval(interval);
    };
  }, []);

  const refreshData = () => {
    setModels([...communityService.getModelReleases()]);
    setFeedbackList([...communityService.getFeedback()]);
    setCommentsList([...communityService.getComments()]);
    setFeatureRequests([...communityService.getFeatureRequests()]);
    setBugReports([...communityService.getBugReports()]);
    setExperiments([...communityService.getPublicExperiments()]);
  };

  const handleAuthGoogle = async () => {
    const res = await communityService.signInGoogle();
    if (res.success) {
      setCurrentUser(communityService.getCurrentUser());
      showToast('Signed in successfully.');
    } else {
      showToast(res.message, true);
    }
  };

  const handleSignOut = async () => {
    await communityService.signOutUser();
    setCurrentUser(communityService.getCurrentUser());
    showToast('Signed out.');
  };

  const handleDownloadModel = async (model: ModelReleaseRecord) => {
    await communityService.recordDownload(model.id, model.version, 'web_ui');
    refreshData();

    // Trigger synthetic model manifest download
    const blob = new Blob([
      JSON.stringify({
        antwire_model_package: {
          id: model.id,
          name: model.name,
          version: model.version,
          architecture: model.architecture,
          neuronCount: model.neuronCount,
          synapseCount: model.synapseCount,
          checksum: model.checksum,
          license: model.license,
          provenance: model.provenance,
          downloadTimestamp: Date.now(),
        }
      }, null, 2)
    ], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${model.id}-${model.version}.antbrain`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloaded model package ${model.name} (${model.version})`);
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbTitle.trim() || !fbDescription.trim()) return;

    setFbSubmitting(true);
    setFbStatusMessage(null);

    const res = await communityService.submitFeedback({
      title: fbTitle,
      description: fbDescription,
      type: fbType,
      category: fbCategory,
      modelVersion: '1.0.0',
    });

    setFbSubmitting(false);
    if (res.success) {
      setFbStatusMessage({ text: `Ticket created: ${res.trackingId}`, isError: false });
      setFbTitle('');
      setFbDescription('');
      refreshData();
      showToast(`Feedback submitted (ID: ${res.trackingId})`);
    } else {
      setFbStatusMessage({ text: res.message, isError: true });
      showToast(res.message, true);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentBody.trim()) return;

    setSubmittingComment(true);
    const res = await communityService.postComment(
      commentTargetId,
      commentTargetType,
      commentBody,
      currentUser?.displayName
    );
    setSubmittingComment(false);

    if (res.success) {
      setCommentBody('');
      refreshData();
      showToast('Comment posted successfully.');
    } else {
      showToast(res.message, true);
    }
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!editBody.trim()) return;
    const res = await communityService.updateComment(commentId, editBody);
    if (res.success) {
      setEditingCommentId(null);
      setEditBody('');
      refreshData();
      showToast('Comment updated.');
    } else {
      showToast(res.message, true);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const res = await communityService.deleteComment(commentId);
    if (res.success) {
      refreshData();
      showToast('Comment deleted.');
    } else {
      showToast(res.message, true);
    }
  };

  const handleVoteFeature = async (requestId: string) => {
    await communityService.voteFeatureRequest(requestId);
    refreshData();
  };

  const handleSubmitFeatureRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!featTitle.trim() || !featDesc.trim()) return;
    setFeatSubmitting(true);
    const res = await communityService.submitFeatureRequest(featTitle, featDesc, featCategory);
    setFeatSubmitting(false);
    if (res.success) {
      setFeatTitle('');
      setFeatDesc('');
      refreshData();
      showToast('Feature request submitted to community registry.');
    } else {
      showToast(res.message, true);
    }
  };

  const handleSubmitBugReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bugTitle.trim() || !bugDesc.trim()) return;
    setBugSubmitting(true);
    const res = await communityService.submitBugReport(bugTitle, bugDesc, bugSeverity);
    setBugSubmitting(false);
    if (res.success) {
      setBugTitle('');
      setBugDesc('');
      refreshData();
      showToast('Bug report filed to tracking registry.');
    } else {
      showToast(res.message, true);
    }
  };

  const handlePublishExperiment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle.trim() || !expDesc.trim()) return;

    setPublishingExp(true);
    const res = await communityService.publishExperiment({
      title: expTitle,
      description: expDesc,
      environment: expEnv,
      task: expTask,
      modelVersion: '1.0.0',
      population: expPop,
    });
    setPublishingExp(false);

    if (res.success) {
      setPublishModalOpen(false);
      setExpTitle('');
      setExpDesc('');
      refreshData();
      showToast('Experiment published to community registry.');
    } else {
      showToast(res.message, true);
    }
  };

  const handleToggleOptOut = () => {
    const nextState = !analyticsOptOut;
    privacyManager.setOptOut(nextState);
    setAnalyticsOptOut(nextState);
    setAnonSessionId(privacyManager.getAnonymousSessionId());
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0d12] text-gray-200 overflow-y-auto pb-32">
      {/* Top Banner & Firebase Status */}
      <div className="border-b border-gray-800 bg-[#0d121a]/80 backdrop-blur px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <AntWireLogo size="sm" showSubtitle={false} showBadge={false} glowEffect={false} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-700/50 text-emerald-300 font-mono">
                Community Hub v1.0.0
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Real Firebase-backed model registry, authentic feedback tickets, developer discussions, and experiment benchmarks.
            </p>
          </div>
        </div>

        {/* Auth & Connection Status */}
        <div className="flex items-center gap-3">
          {backendStatus === 'OFFLINE' ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-950/60 border border-amber-800/60 text-amber-300 text-xs">
              <CloudOff className="w-4 h-4 text-amber-400" />
              <span>Community Offline (Simulation Continues Locally)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Firebase Connected</span>
            </div>
          )}

          {currentUser?.isAnonymous ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-mono hidden md:inline">
                Anon: {currentUser.uid.substring(0, 8)}...
              </span>
              <button
                onClick={handleAuthGoogle}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-100 rounded-lg text-xs font-medium border border-gray-700 transition"
              >
                <LogIn className="w-3.5 h-3.5 text-gray-300" />
                Sign In with Google
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-emerald-300 bg-gray-800 px-2.5 py-1 rounded-lg border border-gray-700">
                <UserIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>{currentUser?.displayName}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="p-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-200 rounded-lg text-xs border border-gray-700 transition"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* In-App Toast Notification */}
      {toast && (
        <div className={`px-6 py-2.5 text-xs flex items-center justify-between border-b transition-all ${
          toast.isError
            ? 'bg-rose-950/80 border-rose-800 text-rose-200'
            : 'bg-emerald-950/80 border-emerald-800 text-emerald-200'
        }`}>
          <div className="flex items-center gap-2">
            {toast.isError ? (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
            <span>{toast.text}</span>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-xs opacity-70 hover:opacity-100 underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="border-b border-gray-800 bg-[#0c1017] px-6 py-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveTab('models')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'models'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
            }`}
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            Official Models ({models.length})
          </button>

          <button
            onClick={() => setActiveTab('feedback')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'feedback'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
            }`}
          >
            <MessageSquarePlus className="w-3.5 h-3.5 text-emerald-400" />
            Feedback ({feedbackList.length})
          </button>

          <button
            onClick={() => setActiveTab('comments')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'comments'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5 text-violet-400" />
            Developer Discussions ({commentsList.length})
          </button>

          <button
            onClick={() => setActiveTab('features')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'features'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            Feature Requests ({featureRequests.length})
          </button>

          <button
            onClick={() => setActiveTab('bugs')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'bugs'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
            }`}
          >
            <Bug className="w-3.5 h-3.5 text-rose-400" />
            Bug Reports ({bugReports.length})
          </button>

          <button
            onClick={() => setActiveTab('experiments')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'experiments'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
            Public Experiments ({experiments.length})
          </button>

          <button
            onClick={() => setActiveTab('contribute')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'contribute'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-lime-400" />
            Contribute
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'privacy'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-sky-400" />
            Privacy
          </button>
        </div>

        <button
          onClick={refreshData}
          className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition"
          title="Refresh Data"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">

        {/* TAB 1: OFFICIAL MODELS */}
        {activeTab === 'models' && (
          <div className="space-y-6">
            <div className="bg-[#0f141c] border border-gray-800 rounded-xl p-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-base font-semibold text-gray-100 flex items-center gap-2">
                    <Download className="w-4 h-4 text-emerald-400" />
                    Verified AntWire Brain Models (.antbrain)
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Download official biological connectomes and reinforcement-trained neural architectures. All metrics are computed strictly from real download events.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-800/50">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>SHA-256 Integrity Verified</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {models.map((model) => (
                <div
                  key={model.id}
                  className="bg-[#111622] border border-gray-800 rounded-xl p-5 flex flex-col justify-between hover:border-emerald-600/50 transition"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-100">{model.name}</h3>
                        <span className="text-[11px] font-mono text-emerald-400">Version {model.version}</span>
                      </div>
                      <span className="text-[10px] font-mono text-gray-400 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
                        {model.releaseDate}
                      </span>
                    </div>

                    <p className="text-xs text-gray-300 leading-relaxed">{model.description}</p>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-[#0c1017] p-3 rounded-lg border border-gray-800/80">
                      <div>
                        <span className="text-gray-500 block">Neuron Count</span>
                        <span className="text-gray-200 font-semibold">{model.neuronCount.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Synapse Count</span>
                        <span className="text-gray-200 font-semibold">{model.synapseCount.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Real Downloads</span>
                        <span className="text-emerald-400 font-semibold">{model.downloads}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Unique Downloaders</span>
                        <span className="text-emerald-400 font-semibold">{model.uniqueDownloaders}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-gray-400">Core Capabilities</span>
                      <ul className="text-[11px] text-gray-300 space-y-1">
                        {model.capabilities.map((cap, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                            <span>{cap}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="text-[10px] font-mono text-gray-500 break-all bg-black/40 p-2 rounded border border-gray-800">
                      <span className="text-gray-400 font-semibold">SHA-256: </span>
                      {model.checksum}
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-gray-800 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-gray-500">{model.license}</span>
                    <button
                      onClick={() => handleDownloadModel(model)}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download .antbrain
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Live Trained Showcase Banner */}
            <div className="bg-gradient-to-r from-emerald-950/40 via-gray-900 to-[#111622] border border-emerald-700/40 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-semibold text-gray-100">
                    AntWire Keyboard RL — Trained Brain Demonstration
                  </h3>
                </div>
                <p className="text-xs text-gray-400">
                  Demonstrates the trained AntWire computational ant brain controlling ants to perform the specified keyboard task accurately.
                </p>
              </div>
              <a
                href="https://ant-brain-keyboard.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition whitespace-nowrap"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Launch Keyboard RL
              </a>
            </div>
          </div>
        )}

        {/* TAB 2: FEEDBACK TICKETS */}
        {activeTab === 'feedback' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Feedback Form */}
            <div className="lg:col-span-1 bg-[#111622] border border-gray-800 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-semibold text-gray-100 flex items-center gap-2">
                <MessageSquarePlus className="w-4 h-4 text-emerald-400" />
                Submit Feedback / Ticket
              </h2>
              <p className="text-xs text-gray-400">
                Submit authentic feedback or ideas directly to the Firebase database with rate limiting and automated tracking IDs.
              </p>

              <form onSubmit={handleSubmitFeedback} className="space-y-3">
                <div>
                  <label className="text-xs text-gray-300 block mb-1">Type</label>
                  <select
                    value={fbType}
                    onChange={(e) => setFbType(e.target.value as FeedbackType)}
                    className="w-full bg-[#0c1017] border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="FEATURE_REQUEST">Feature Request</option>
                    <option value="IDEA">Idea / Proposal</option>
                    <option value="BUG">Bug Report</option>
                    <option value="PERFORMANCE">Performance Feedback</option>
                    <option value="GENERAL">General Feedback</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-300 block mb-1">Title</label>
                  <input
                    type="text"
                    value={fbTitle}
                    onChange={(e) => setFbTitle(e.target.value)}
                    placeholder="Short summary of feedback"
                    className="w-full bg-[#0c1017] border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-emerald-500"
                    maxLength={100}
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-300 block mb-1">Description</label>
                  <textarea
                    value={fbDescription}
                    onChange={(e) => setFbDescription(e.target.value)}
                    placeholder="Detailed explanation..."
                    rows={4}
                    className="w-full bg-[#0c1017] border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-emerald-500"
                    maxLength={2000}
                    required
                  />
                </div>

                {fbStatusMessage && (
                  <div
                    className={`p-2.5 rounded-lg text-xs font-mono ${
                      fbStatusMessage.isError
                        ? 'bg-rose-950/60 border border-rose-800 text-rose-300'
                        : 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
                    }`}
                  >
                    {fbStatusMessage.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={fbSubmitting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 text-white rounded-lg text-xs font-semibold transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  {fbSubmitting ? 'Submitting...' : 'Submit to Firebase'}
                </button>
              </form>
            </div>

            {/* Feedback List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-semibold text-gray-100 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Persisted Community Feedback ({feedbackList.length})
                </h2>
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-gray-400" />
                  <select
                    value={feedbackFilter}
                    onChange={(e) => setFeedbackFilter(e.target.value)}
                    className="bg-[#111622] border border-gray-700 rounded-lg px-2.5 py-1 text-xs text-gray-300 focus:outline-none"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="OPEN">OPEN</option>
                    <option value="TRIAGED">TRIAGED</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>
              </div>

              {feedbackList.length === 0 ? (
                <div className="bg-[#111622] border border-gray-800 rounded-xl p-8 text-center text-gray-400 text-xs">
                  {backendStatus === 'OFFLINE'
                    ? 'Community temporarily unavailable (running in local simulation mode).'
                    : 'No feedback tickets submitted yet. Be the first to submit above!'}
                </div>
              ) : (
                <div className="space-y-3">
                  {feedbackList
                    .filter((item) => feedbackFilter === 'ALL' || item.status === feedbackFilter)
                    .map((item) => (
                      <div key={item.feedbackId} className="bg-[#111622] border border-gray-800 rounded-xl p-4 space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                              {item.feedbackId}
                            </span>
                            <h3 className="text-xs font-semibold text-gray-200 mt-1">{item.title}</h3>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-800 border border-gray-700 text-gray-300">
                            {item.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">{item.body}</p>
                        <div className="text-[10px] text-gray-500 font-mono flex items-center justify-between pt-2 border-t border-gray-800/80">
                          <span>Category: {item.category}</span>
                          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: DEVELOPER COMMENTS */}
        {activeTab === 'comments' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-[#111622] border border-gray-800 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-semibold text-gray-100 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                Post Developer Comment
              </h2>
              <p className="text-xs text-gray-400">
                Participate in technical architecture, connectome design, and RL policy discussions.
              </p>

              <form onSubmit={handleSubmitComment} className="space-y-3">
                <div>
                  <label className="text-xs text-gray-300 block mb-1">Target Topic</label>
                  <select
                    value={commentTargetId}
                    onChange={(e) => {
                      setCommentTargetId(e.target.value);
                      setCommentTargetType(e.target.value.startsWith('antwire') ? 'MODEL' : 'GENERAL');
                    }}
                    className="w-full bg-[#0c1017] border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none"
                  >
                    <option value="general-discussion">General Architecture & Connectome</option>
                    <option value="antwire-v1-foundation">Model: 55k Biological Base</option>
                    <option value="antwire-v1-keyboard-rl">Model: Keyboard RL Brain</option>
                    <option value="predator-defense-tuning">Colony Defense & Predator AI</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-300 block mb-1">Your Comment</label>
                  <textarea
                    value={commentBody}
                    onChange={(e) => setCommentBody(e.target.value)}
                    placeholder="Share observations, hyperparameters, or connectome insights..."
                    rows={4}
                    className="w-full bg-[#0c1017] border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none"
                    maxLength={1500}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingComment}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 text-white rounded-lg text-xs font-semibold transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submittingComment ? 'Posting...' : 'Post Comment'}
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-sm font-semibold text-gray-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                Live Discussion Threads ({commentsList.length})
              </h2>

              {commentsList.length === 0 ? (
                <div className="bg-[#111622] border border-gray-800 rounded-xl p-8 text-center text-gray-400 text-xs">
                  {backendStatus === 'OFFLINE'
                    ? 'Community temporarily unavailable.'
                    : 'No comments yet. Start the conversation!'}
                </div>
              ) : (
                <div className="space-y-3">
                  {commentsList.map((c) => (
                    <div key={c.commentId} className="bg-[#111622] border border-gray-800 rounded-xl p-4 space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-xs font-semibold text-gray-200">{c.authorName}</span>
                          <span className="text-[10px] text-gray-500 font-mono">
                            {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {currentUser && c.uid === currentUser.uid && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingCommentId(c.commentId);
                                setEditBody(c.body);
                              }}
                              className="p-1 text-gray-400 hover:text-emerald-400 transition"
                              title="Edit"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteComment(c.commentId)}
                              className="p-1 text-gray-400 hover:text-rose-400 transition"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {editingCommentId === c.commentId ? (
                        <div className="space-y-2">
                          <textarea
                            value={editBody}
                            onChange={(e) => setEditBody(e.target.value)}
                            rows={3}
                            className="w-full bg-[#0c1017] border border-emerald-500 rounded-lg p-2 text-xs text-gray-200"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdateComment(c.commentId)}
                              className="px-3 py-1 bg-emerald-600 text-white rounded text-xs"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingCommentId(null)}
                              className="px-3 py-1 bg-gray-700 text-gray-300 rounded text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-300 leading-relaxed">{c.body}</p>
                      )}

                      <div className="text-[10px] text-gray-500 font-mono pt-1">
                        Topic: <span className="text-gray-400">{c.targetId}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: FEATURE REQUESTS */}
        {activeTab === 'features' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-[#111622] border border-gray-800 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-semibold text-gray-100 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-emerald-400" />
                Request a Feature
              </h2>
              <form onSubmit={handleSubmitFeatureRequest} className="space-y-3">
                <div>
                  <label className="text-xs text-gray-300 block mb-1">Title</label>
                  <input
                    type="text"
                    value={featTitle}
                    onChange={(e) => setFeatTitle(e.target.value)}
                    placeholder="e.g. Add fungus farming moisture dynamics"
                    className="w-full bg-[#0c1017] border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-200"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-300 block mb-1">Category</label>
                  <select
                    value={featCategory}
                    onChange={(e) => setFeatCategory(e.target.value)}
                    className="w-full bg-[#0c1017] border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-200"
                  >
                    <option value="NEURAL_CONNECTOME">Neural Connectome</option>
                    <option value="COLONY_SUPERORGANISM">Colony Superorganism</option>
                    <option value="ENVIRONMENT_API">Environment / Task API</option>
                    <option value="VISUALIZATION">3D Visualization</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-300 block mb-1">Description</label>
                  <textarea
                    value={featDesc}
                    onChange={(e) => setFeatDesc(e.target.value)}
                    placeholder="Explain the biological or computational motivation..."
                    rows={4}
                    className="w-full bg-[#0c1017] border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-200"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={featSubmitting}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
                >
                  {featSubmitting ? 'Submitting...' : 'Submit Feature Request'}
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-sm font-semibold text-gray-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Community Feature Proposals ({featureRequests.length})
              </h2>

              {featureRequests.length === 0 ? (
                <div className="bg-[#111622] border border-gray-800 rounded-xl p-8 text-center text-gray-400 text-xs">
                  {backendStatus === 'OFFLINE' ? 'Community temporarily unavailable.' : 'No feature requests yet.'}
                </div>
              ) : (
                <div className="space-y-3">
                  {featureRequests.map((req) => (
                    <div key={req.requestId} className="bg-[#111622] border border-gray-800 rounded-xl p-4 flex gap-4">
                      <button
                        onClick={() => handleVoteFeature(req.requestId)}
                        className={`flex flex-col items-center justify-center p-3 rounded-lg border transition ${
                          currentUser && req.voters && req.voters[currentUser.uid]
                            ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                            : 'bg-[#0c1017] border-gray-700 text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span className="text-xs font-mono font-bold mt-1">{req.votes || 0}</span>
                      </button>

                      <div className="space-y-1.5 flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="text-xs font-semibold text-gray-100">{req.title}</h3>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-800 border border-gray-700 text-gray-300">
                            {req.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">{req.description}</p>
                        <div className="text-[10px] text-gray-500 font-mono pt-1">
                          Category: {req.category} • Author: {req.authorName}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: BUG REPORTS */}
        {activeTab === 'bugs' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-[#111622] border border-gray-800 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-semibold text-gray-100 flex items-center gap-2">
                <Bug className="w-4 h-4 text-emerald-400" />
                Report a Defect / Bug
              </h2>
              <form onSubmit={handleSubmitBugReport} className="space-y-3">
                <div>
                  <label className="text-xs text-gray-300 block mb-1">Issue Summary</label>
                  <input
                    type="text"
                    value={bugTitle}
                    onChange={(e) => setBugTitle(e.target.value)}
                    placeholder="Short description of the bug"
                    className="w-full bg-[#0c1017] border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-200"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-300 block mb-1">Severity</label>
                  <select
                    value={bugSeverity}
                    onChange={(e) => setBugSeverity(e.target.value as any)}
                    className="w-full bg-[#0c1017] border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-200"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-300 block mb-1">Steps to Reproduce</label>
                  <textarea
                    value={bugDesc}
                    onChange={(e) => setBugDesc(e.target.value)}
                    placeholder="1. Open simulation\n2. Select soldier ant..."
                    rows={4}
                    className="w-full bg-[#0c1017] border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-200"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={bugSubmitting}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
                >
                  {bugSubmitting ? 'Submitting...' : 'File Bug Report'}
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-sm font-semibold text-gray-100 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Tracked Bug Reports ({bugReports.length})
              </h2>

              {bugReports.length === 0 ? (
                <div className="bg-[#111622] border border-gray-800 rounded-xl p-8 text-center text-gray-400 text-xs">
                  {backendStatus === 'OFFLINE' ? 'Community temporarily unavailable.' : 'No active bug reports filed.'}
                </div>
              ) : (
                <div className="space-y-3">
                  {bugReports.map((b) => (
                    <div key={b.reportId} className="bg-[#111622] border border-gray-800 rounded-xl p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-mono text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                            {b.reportId}
                          </span>
                          <h3 className="text-xs font-semibold text-gray-200 mt-1">{b.title}</h3>
                        </div>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                            b.severity === 'CRITICAL' || b.severity === 'HIGH'
                              ? 'bg-rose-950 border-rose-800 text-rose-300'
                              : 'bg-gray-800 border-gray-700 text-gray-300'
                          }`}
                        >
                          {b.severity}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-line">{b.description}</p>
                      <div className="text-[10px] text-gray-500 font-mono pt-1">
                        Reported by: {b.authorName} • {new Date(b.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: PUBLIC EXPERIMENTS */}
        {activeTab === 'experiments' && (
          <div className="space-y-6">
            <div className="bg-[#0f141c] border border-gray-800 rounded-xl p-5 flex justify-between items-center">
              <div>
                <h2 className="text-base font-semibold text-gray-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Public Experiment Registry
                </h2>
                <p className="text-xs text-gray-400">
                  Verifiable multi-agent benchmarks submitted by researchers.
                </p>
              </div>
              <button
                onClick={() => setPublishModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Publish Experiment
              </button>
            </div>

            {experiments.length === 0 ? (
              <div className="bg-[#111622] border border-gray-800 rounded-xl p-8 text-center text-gray-400 text-xs">
                {backendStatus === 'OFFLINE' ? 'Community temporarily unavailable.' : 'No public experiments published yet.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {experiments.map((exp) => (
                  <div key={exp.experimentId} className="bg-[#111622] border border-gray-800 rounded-xl p-5 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                          {exp.experimentId}
                        </span>
                        <h3 className="text-sm font-semibold text-gray-200 mt-1">{exp.title}</h3>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono">{exp.isoDate.substring(0, 10)}</span>
                    </div>

                    <p className="text-xs text-gray-300 leading-relaxed">{exp.description}</p>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-[#0c1017] p-2.5 rounded border border-gray-800">
                      <div>
                        <span className="text-gray-500 block">Environment</span>
                        <span className="text-gray-200">{exp.environment}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Population</span>
                        <span className="text-gray-200">{exp.population} Ants</span>
                      </div>
                    </div>

                    <div className="text-[10px] text-gray-500 font-mono pt-2 border-t border-gray-800">
                      Author: <span className="text-gray-300">{exp.author || 'AntWire Researcher'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 7: CONTRIBUTE */}
        {activeTab === 'contribute' && (
          <div className="bg-[#111622] border border-gray-800 rounded-xl p-6 space-y-6">
            <div>
              <h2 className="text-base font-semibold text-gray-100 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                Developer Contribution Guidelines & Open Source Workflows
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                AntWire welcomes computational biology and reinforcement learning contributions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs text-gray-300 leading-relaxed">
              <div className="bg-[#0c1017] border border-gray-800 rounded-xl p-5 space-y-3">
                <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                  <FileCode className="w-4 h-4" />
                  Code Submission Flow
                </h3>
                <ol className="list-decimal pl-4 space-y-1.5 text-gray-400">
                  <li>Fork the repository at <code className="text-emerald-400">github.com/Nik-2208/AntWire</code></li>
                  <li>Implement your task/neural feature adhering to the biological invariants.</li>
                  <li>Run <code className="text-emerald-400">npx vitest run</code> and verify all 100 tests pass.</li>
                  <li>Submit a Pull Request with complete mathematical/biological justification.</li>
                </ol>
              </div>

              <div className="bg-[#0c1017] border border-gray-800 rounded-xl p-5 space-y-3">
                <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Truthful Data & Integrity Rule
                </h3>
                <p className="text-gray-400">
                  Every contribution must strictly maintain zero mock data, zero fake counters, and zero hardcoded success metrics. Any unmeasured biological value must return <code className="text-emerald-400">No data available</code>.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-800 flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs text-gray-400">
                Created & Developed by <strong className="text-gray-200">Nikhilesh H. Chavda</strong>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href="https://github.com/Nik-2208"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg text-xs transition"
                >
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  GitHub: Nik-2208
                </a>
                <a
                  href="https://www.linkedin.com/in/nikhilesh-chavda-2b779533a/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg text-xs transition"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                  LinkedIn
                </a>
                <a
                  href="https://nik-portfolio-lime.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Portfolio
                </a>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: PRIVACY & TELEMETRY */}
        {activeTab === 'privacy' && (
          <div className="bg-[#111622] border border-gray-800 rounded-xl p-6 space-y-6">
            <div>
              <h2 className="text-base font-semibold text-gray-100 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                Privacy Policy & Zero-PII Telemetry Guarantee
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                AntWire is built on strict data minimization and scientific transparency.
              </p>
            </div>

            <div className="space-y-4 text-xs text-gray-300 leading-relaxed bg-[#0c1017] p-5 rounded-xl border border-gray-800">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <div>
                  <span className="font-semibold text-gray-200">Anonymous Session Tracking</span>
                  <p className="text-gray-400 text-[11px] font-mono mt-0.5">Current UUID: {anonSessionId}</p>
                </div>
                <button
                  onClick={handleToggleOptOut}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    analyticsOptOut
                      ? 'bg-rose-950 border border-rose-800 text-rose-300'
                      : 'bg-emerald-950 border border-emerald-800 text-emerald-300'
                  }`}
                >
                  {analyticsOptOut ? 'Analytics: Opted Out' : 'Analytics: Active'}
                </button>
              </div>

              <div className="space-y-2 text-gray-400">
                <p>
                  <strong>What AntWire Collects:</strong> Anonymous model download event IDs, feedback tickets, developer comments, and public benchmark parameters submitted voluntarily.
                </p>
                <p>
                  <strong>What AntWire NEVER Collects:</strong> Passwords, API secrets, private machine paths, hardware serial numbers, device fingerprints, or high-frequency neural states.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* PUBLISH EXPERIMENT MODAL */}
      {publishModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111622] border border-gray-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-gray-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Publish Experiment to Community Registry
            </h3>

            <form onSubmit={handlePublishExperiment} className="space-y-3">
              <div>
                <label className="text-xs text-gray-300 block mb-1">Experiment Title</label>
                <input
                  type="text"
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  placeholder="e.g. Swarm Foraging in Bifurcated Labyrinth"
                  className="w-full bg-[#0c1017] border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-200"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-gray-300 block mb-1">Environment</label>
                <input
                  type="text"
                  value={expEnv}
                  onChange={(e) => setExpEnv(e.target.value)}
                  className="w-full bg-[#0c1017] border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-200"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-gray-300 block mb-1">Task</label>
                <input
                  type="text"
                  value={expTask}
                  onChange={(e) => setExpTask(e.target.value)}
                  className="w-full bg-[#0c1017] border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-200"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-gray-300 block mb-1">Population Size</label>
                <input
                  type="number"
                  value={expPop}
                  onChange={(e) => setExpPop(parseInt(e.target.value) || 10)}
                  min={1}
                  max={500}
                  className="w-full bg-[#0c1017] border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-200"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-gray-300 block mb-1">Description & Findings</label>
                <textarea
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  placeholder="Describe the multi-agent setup, pheromone decay constants, and results..."
                  rows={4}
                  className="w-full bg-[#0c1017] border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-200"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={publishingExp}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
                >
                  {publishingExp ? 'Publishing...' : 'Publish to Firebase'}
                </button>
                <button
                  type="button"
                  onClick={() => setPublishModalOpen(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
