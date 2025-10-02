import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import LeadForm from '../components/LeadForm';
import { supabase, type Scenario } from '../lib/supabase';
import type { QuestionnaireData } from './SakkanalQualification';
import './SakkanalResults.css';

type RecommendedScenario = {
  scenario: Scenario;
  score: number;
  matchReason: string;
};

const SakkanalResults: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [scenarios, setScenarios] = useState<RecommendedScenario[]>([]);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [leadFormAction, setLeadFormAction] = useState<'contact' | 'download'>('contact');
  const [userInfo, setUserInfo] = useState<any>(null);

  const formData = (location.state as { formData: QuestionnaireData })?.formData;

  useEffect(() => {
    if (!formData) {
      navigate('/sakkanal/qualification');
      return;
    }

    loadAndMatchScenarios();
  }, [formData]);

  const loadAndMatchScenarios = async () => {
    try {
      const { data, error } = await supabase
        .from('scenarios')
        .select('*')
        .order('category', { ascending: true });
  
      if (error) throw error;
  
      const matched = matchScenarios(data || []);
      setScenarios(matched);
    } catch (error) {
      console.error('Error loading scenarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const matchScenarios = (allScenarios: Scenario[]): RecommendedScenario[] => {
    if (!formData) return [];

    return allScenarios
      .map((scenario) => {
        let score = 0;
        const reasons: string[] = [];

        if (scenario.site_types.includes(formData.siteType)) {
          score += 30;
          reasons.push('Compatible avec votre type de site');
        }

        if (formData.budget > 0) {
          if (
            formData.budget >= scenario.min_budget &&
            (!scenario.max_budget || formData.budget <= scenario.max_budget)
          ) {
            score += 25;
            reasons.push('Correspond à votre budget');
          }
        } else {
          score += 10;
        }

        const estimatedMonthlyCost = formData.electricityBill;
        if (estimatedMonthlyCost > 500000 && scenario.category === 'premium') {
          score += 20;
          reasons.push('Recommandé pour votre niveau de consommation');
        } else if (estimatedMonthlyCost > 200000 && scenario.category === 'standard') {
          score += 20;
          reasons.push('Optimal pour votre consommation');
        } else if (scenario.category === 'economique') {
          score += 15;
          reasons.push('Solution économique adaptée');
        }

        if (formData.specificNeeds.includes('IA prédictive') && scenario.category === 'premium') {
          score += 15;
          reasons.push('Inclut intelligence artificielle');
        }

        if (formData.specificNeeds.includes('Pilotage à distance')) {
          score += 10;
          reasons.push('Contrôle à distance disponible');
        }

        return {
          scenario,
          score,
          matchReason: reasons.join(', '),
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  };

  const calculateMonthlySavings = (electricityBill: number, savingsPercent: number): number => {
    return (electricityBill * savingsPercent) / 100;
  };

  const calculateAnnualSavings = (monthlySavings: number): number => {
    return monthlySavings * 12;
  };

  const generatePDFReport = (scenario: Scenario, userData: any) => {
    // Génération du contenu HTML pour le PDF
    const monthlySavings = calculateMonthlySavings(
      formData!.electricityBill,
      scenario.estimated_savings
    );
    const annualSavings = calculateAnnualSavings(monthlySavings);
    const totalSavingsOverLifespan = annualSavings * scenario.equipment_lifespan;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Rapport Sakkanal - ${scenario.name}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #00b894; padding-bottom: 20px; }
          .header h1 { color: #00b894; margin: 0; }
          .section { margin: 30px 0; }
          .section h2 { color: #00b894; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
          .info-item { background: #f8f9fa; padding: 15px; border-radius: 8px; }
          .info-label { font-weight: bold; color: #555; font-size: 14px; }
          .info-value { font-size: 18px; color: #00b894; margin-top: 5px; }
          .highlight-box { background: linear-gradient(135deg, #00b894 0%, #00cec9 100%); color: white; padding: 25px; border-radius: 12px; margin: 20px 0; }
          .highlight-box h3 { margin: 0 0 15px 0; }
          .savings-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
          .savings-item { text-align: center; }
          .savings-value { font-size: 24px; font-weight: bold; }
          .savings-label { font-size: 14px; opacity: 0.9; }
          .features { list-style: none; padding: 0; }
          .features li { padding: 10px 0; border-bottom: 1px solid #e0e0e0; }
          .features li:before { content: "✓ "; color: #00b894; font-weight: bold; margin-right: 10px; }
          .footer { margin-top: 40px; text-align: center; padding-top: 20px; border-top: 2px solid #e0e0e0; color: #777; }
          .contact-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🌞 SAKKANAL</h1>
          <p>Votre Solution Énergétique Personnalisée</p>
          <p style="color: #777; font-size: 14px;">Rapport généré le ${new Date().toLocaleDateString('fr-FR')}</p>
        </div>

        <div class="section">
          <h2>📋 Informations Client</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Nom complet</div>
              <div class="info-value">${userData.fullName}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Entreprise</div>
              <div class="info-value">${userData.company || 'Non renseigné'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Email</div>
              <div class="info-value">${userData.email}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Téléphone</div>
              <div class="info-value">${userData.phone}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>🏢 Votre Profil Énergétique</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Type de site</div>
              <div class="info-value">${formData!.siteType}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Facture mensuelle actuelle</div>
              <div class="info-value">${formData!.electricityBill.toLocaleString()} FCFA</div>
            </div>
            <div class="info-item">
              <div class="info-label">Puissance installée</div>
              <div class="info-value">${formData!.installationPower} kW</div>
            </div>
            <div class="info-item">
              <div class="info-label">Budget prévu</div>
              <div class="info-value">${formData!.budget > 0 ? formData!.budget.toLocaleString() + ' FCFA' : 'À définir'}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>⚡ Solution Recommandée : ${scenario.name}</h2>
          <p style="background: #f8f9fa; padding: 15px; border-radius: 8px; font-size: 16px; line-height: 1.6;">
            ${scenario.description}
          </p>
          <div style="margin-top: 15px;">
            <span style="background: #00b894; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: bold;">
              ${scenario.category.toUpperCase()}
            </span>
          </div>
        </div>

        <div class="highlight-box">
          <h3>💰 Vos Économies Estimées</h3>
          <div class="savings-grid">
            <div class="savings-item">
              <div class="savings-value">${scenario.estimated_savings}%</div>
              <div class="savings-label">Taux d'économie</div>
            </div>
            <div class="savings-item">
              <div class="savings-value">${monthlySavings.toLocaleString()} FCFA</div>
              <div class="savings-label">Par mois</div>
            </div>
            <div class="savings-item">
              <div class="savings-value">${annualSavings.toLocaleString()} FCFA</div>
              <div class="savings-label">Par an</div>
            </div>
          </div>
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.3); text-align: center;">
            <div class="savings-label">Économies totales sur ${scenario.equipment_lifespan} ans</div>
            <div class="savings-value" style="font-size: 32px;">${totalSavingsOverLifespan.toLocaleString()} FCFA</div>
          </div>
        </div>

        <div class="section">
          <h2>🎯 Caractéristiques de la Solution</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Durée de vie des équipements</div>
              <div class="info-value">${scenario.equipment_lifespan} ans</div>
            </div>
            <div class="info-item">
              <div class="info-label">Catégorie</div>
              <div class="info-value">${scenario.category}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>📞 Prochaines Étapes</h2>
          <div class="contact-info">
            <p style="margin: 0 0 15px 0; font-size: 16px;">
              <strong>Un de nos conseillers vous contactera sous 24-48h pour :</strong>
            </p>
            <ul class="features">
              <li>Affiner l'analyse de vos besoins</li>
              <li>Réaliser une étude technique détaillée</li>
              <li>Vous présenter un devis personnalisé</li>
              <li>Planifier une visite sur site si nécessaire</li>
              <li>Répondre à toutes vos questions</li>
            </ul>
          </div>
        </div>

        <div class="footer">
          <p><strong>SAKKANAL</strong> - Solutions Énergétiques Intelligentes</p>
          <p>📧 contact@sakkanal.com | 📱 +221 XX XXX XX XX</p>
          <p style="font-size: 12px; margin-top: 15px;">
            Ce rapport est basé sur les informations fournies et constitue une estimation. 
            Un audit complet sera nécessaire pour une proposition définitive.
          </p>
        </div>
      </body>
      </html>
    `;

    // Créer un blob et télécharger
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Rapport_Sakkanal_${scenario.name.replace(/\s+/g, '_')}_${new Date().getTime()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleContactRequest = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setLeadFormAction('contact');
    setShowLeadForm(true);
  };

  const handleDownloadRequest = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setLeadFormAction('download');
    setShowLeadForm(true);
  };

  const handleLeadFormSuccess = (userData: any) => {
    setUserInfo(userData);
    setShowLeadForm(false);

    if (leadFormAction === 'download' && selectedScenario) {
      // Générer et télécharger le PDF
      setTimeout(() => {
        generatePDFReport(selectedScenario, userData);
        alert('✅ Votre rapport détaillé a été téléchargé avec succès ! Un conseiller vous contactera sous 24-48h.');
      }, 300);
    } else {
      alert('✅ Votre demande a été envoyée avec succès ! Nous vous contacterons très prochainement.');
    }
  };

  const getCategoryBadgeClass = (category: string): string => {
    switch (category) {
      case 'economique':
        return 'badge-economique';
      case 'standard':
        return 'badge-standard';
      case 'premium':
        return 'badge-premium';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="results-page">
        <Header />
        <div className="loading-container">
          <div className="loader"></div>
          <p>Analyse de vos besoins en cours...</p>
        </div>
      </div>
    );
  }

  if (!formData) {
    return null;
  }

  return (
    <div className="results-page">
      <Header />

      <section className="results-section">
        <div className="container">
          <div className="results-header" data-aos="fade-up">
            <h1>Vos solutions <span className="gradient-text">personnalisées</span></h1>
            <p>Nous avons analysé vos besoins et voici nos recommandations</p>
          </div>

          <div className="results-summary" data-aos="fade-up" data-aos-delay="100">
            <div className="summary-card">
              <i className="fas fa-building"></i>
              <div>
                <span className="summary-label">Type de site</span>
                <span className="summary-value">{formData.siteType}</span>
              </div>
            </div>
            <div className="summary-card">
              <i className="fas fa-bolt"></i>
              <div>
                <span className="summary-label">Facture mensuelle</span>
                <span className="summary-value">{formData.electricityBill.toLocaleString()} FCFA</span>
              </div>
            </div>
            <div className="summary-card">
              <i className="fas fa-plug"></i>
              <div>
                <span className="summary-label">Puissance installée</span>
                <span className="summary-value">{formData.installationPower} kW</span>
              </div>
            </div>
          </div>

          <div className="scenarios-grid">
            {scenarios.map((item, index) => {
              const monthlySavings = calculateMonthlySavings(
                formData.electricityBill,
                item.scenario.estimated_savings
              );
              const annualSavings = calculateAnnualSavings(monthlySavings);

              return (
                <div
                  key={item.scenario.id}
                  className={`scenario-card ${index === 0 ? 'recommended' : ''}`}
                  data-aos="fade-up"
                  data-aos-delay={200 + index * 100}
                >
                  {index === 0 && (
                    <div className="recommended-badge">
                      <i className="fas fa-star"></i> Recommandé
                    </div>
                  )}

                  <div className="scenario-header">
                    <div>
                      <h3>{item.scenario.name}</h3>
                      <span className={`category-badge ${getCategoryBadgeClass(item.scenario.category)}`}>
                        {item.scenario.category.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <p className="scenario-description">{item.scenario.description}</p>

                  <div className="scenario-match">
                    <i className="fas fa-check-circle"></i>
                    <span>{item.matchReason}</span>
                  </div>

                  <div className="scenario-metrics">
                    <div className="metric">
                      <div className="metric-icon">
                        <i className="fas fa-percentage"></i>
                      </div>
                      <div>
                        <span className="metric-value">{item.scenario.estimated_savings}%</span>
                        <span className="metric-label">Économies estimées</span>
                      </div>
                    </div>

                    <div className="metric">
                      <div className="metric-icon">
                        <i className="fas fa-coins"></i>
                      </div>
                      <div>
                        <span className="metric-value">{monthlySavings.toLocaleString()} FCFA</span>
                        <span className="metric-label">Économies mensuelles</span>
                      </div>
                    </div>

                    <div className="metric">
                      <div className="metric-icon">
                        <i className="fas fa-calendar-alt"></i>
                      </div>
                      <div>
                        <span className="metric-value">{item.scenario.equipment_lifespan} ans</span>
                        <span className="metric-label">Durée de vie</span>
                      </div>
                    </div>

                    <div className="metric highlight">
                      <div className="metric-icon">
                        <i className="fas fa-chart-line"></i>
                      </div>
                      <div>
                        <span className="metric-value">{annualSavings.toLocaleString()} FCFA</span>
                        <span className="metric-label">Économies annuelles</span>
                      </div>
                    </div>
                  </div>

                  <div className="scenario-actions">
                    <button
                      className="action-btn primary"
                      onClick={() => handleContactRequest(item.scenario)}
                    >
                      <i className="fas fa-user-tie"></i> Contacter un conseiller
                    </button>
                    <button 
                      className="action-btn secondary"
                      onClick={() => handleDownloadRequest(item.scenario)}
                    >
                      <i className="fas fa-file-pdf"></i> Télécharger le rapport
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="results-cta" data-aos="fade-up">
            <h2>Besoin d'aide pour choisir ?</h2>
            <p>Nos experts sont là pour vous accompagner dans votre projet</p>
            <div className="cta-buttons">
              <button className="cta-btn primary">
                <i className="fas fa-phone"></i> Appeler maintenant
              </button>
              <button className="cta-btn secondary" onClick={() => navigate('/sakkanal/qualification')}>
                <i className="fas fa-redo"></i> Refaire le questionnaire
              </button>
            </div>
          </div>
        </div>
      </section>

      {showLeadForm && selectedScenario && formData && (
        <LeadForm
          scenario={selectedScenario}
          formData={formData}
          onClose={() => setShowLeadForm(false)}
                  onSuccess={handleLeadFormSuccess}
  actionType={leadFormAction}
        />
      )}
    </div>
  );
};

export default SakkanalResults;