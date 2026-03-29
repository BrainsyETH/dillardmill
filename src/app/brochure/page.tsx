'use client';

export default function BrochurePage() {
  return (
    <>
      <style>{`
        @media print {
          @page {
            size: 11in 8.5in;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          .brochure-side {
            page-break-after: always;
            break-after: page;
          }
          .brochure-side:last-child {
            page-break-after: avoid;
            break-after: avoid;
          }
        }
        @media screen {
          .brochure-side {
            margin: 20px auto;
            box-shadow: 0 4px 24px rgba(0,0,0,0.15);
          }
        }
      `}</style>

      {/* Print Button */}
      <div className="no-print" style={{
        textAlign: 'center',
        padding: '24px',
        background: '#f5f5f5',
        fontFamily: 'var(--font-sans)',
      }}>
        <h1 style={{
          fontFamily: 'var(--font-serif)',
          color: '#2D5A47',
          fontSize: '24px',
          marginBottom: '8px',
        }}>
          Pine Valley at Dillard Mill — Tri-Fold Brochure
        </h1>
        <p style={{ color: '#374151', marginBottom: '16px', fontSize: '14px' }}>
          Print this page (Ctrl+P / Cmd+P) using <strong>Landscape</strong> orientation, <strong>Letter</strong> size, with <strong>Background graphics</strong> enabled and <strong>Margins: None</strong>.
        </p>
        <button
          onClick={() => window.print()}
          style={{
            background: '#B87333',
            color: 'white',
            border: 'none',
            padding: '12px 32px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Print Brochure
        </button>
      </div>

      {/* ===== FRONT SIDE (Page 1) ===== */}
      <div
        className="brochure-side"
        style={{
          width: '11in',
          height: '8.5in',
          display: 'flex',
          overflow: 'hidden',
          fontFamily: 'var(--font-sans)',
        }}
      >
        {/* Panel 1: Back Cover — Contact Info */}
        <div style={{
          width: '33.333%',
          height: '100%',
          background: '#2D5A47',
          color: '#FAFAF8',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0.5in 0.4in',
          textAlign: 'center',
          position: 'relative',
        }}>
          {/* Decorative top accent */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: '#B87333',
          }} />

          <div style={{ marginBottom: '24px' }}>
            <div style={{
              width: '60px',
              height: '60px',
              border: '2px solid #B87333',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: '24px',
            }}>
              🌲
            </div>
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '18px',
              fontWeight: 600,
              color: '#FAFAF8',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginBottom: '4px',
            }}>
              Plan Your Visit
            </h2>
            <div style={{
              width: '40px',
              height: '2px',
              background: '#B87333',
              margin: '0 auto',
            }} />
          </div>

          <div style={{ fontSize: '13px', lineHeight: 1.8 }}>
            <p style={{ fontWeight: 600, fontSize: '14px', marginBottom: '12px' }}>
              126 Dillard Mill Road<br />
              Davisville, MO 65456
            </p>

            <div style={{
              width: '24px',
              height: '1px',
              background: '#7A9E8E',
              margin: '12px auto',
            }} />

            <p style={{ marginBottom: '6px' }}>
              <span style={{ color: '#B87333' }}>P</span>&nbsp; (314) 843-4321
            </p>
            <p style={{ marginBottom: '6px' }}>
              <span style={{ color: '#B87333' }}>E</span>&nbsp; pinevalley@dillardmill.com
            </p>
            <p style={{ marginBottom: '16px' }}>
              <span style={{ color: '#B87333' }}>W</span>&nbsp; dillardmill.com
            </p>

            <div style={{
              width: '24px',
              height: '1px',
              background: '#7A9E8E',
              margin: '12px auto',
            }} />

            <p style={{ fontSize: '12px', color: '#7A9E8E', marginBottom: '6px' }}>
              Follow Us
            </p>
            <p style={{ fontSize: '12px' }}>
              Instagram: @pinevalleydm
            </p>
            <p style={{ fontSize: '12px' }}>
              Facebook: @pinevalley
            </p>
          </div>

          <div style={{
            marginTop: '24px',
            padding: '12px 20px',
            border: '1px solid #7A9E8E',
            borderRadius: '6px',
            fontSize: '11px',
            color: '#7A9E8E',
            lineHeight: 1.6,
          }}>
            Book directly on our website<br />
            or find us on Airbnb &amp; Hipcamp
          </div>

          {/* Decorative bottom accent */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: '#B87333',
          }} />
        </div>

        {/* Panel 2: Inside Flap — Area Attractions */}
        <div style={{
          width: '33.333%',
          height: '100%',
          background: '#FAFAF8',
          padding: '0.5in 0.35in',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}>
          {/* Decorative top bar */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: 'linear-gradient(to right, #2D5A47, #7A9E8E)',
          }} />

          <div style={{ textAlign: 'center', marginBottom: '20px', marginTop: '8px' }}>
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '20px',
              fontWeight: 600,
              color: '#2D5A47',
              marginBottom: '4px',
            }}>
              Explore the Area
            </h2>
            <div style={{
              width: '40px',
              height: '2px',
              background: '#B87333',
              margin: '0 auto',
            }} />
          </div>

          {/* Attraction items */}
          {[
            {
              icon: '🏛️',
              name: 'Dillard Mill',
              distance: 'Walking Distance',
              desc: 'A beautifully restored 1908 gristmill on Huzzah Creek. One of Missouri\'s best-preserved, with original machinery intact. Free admission year-round.',
            },
            {
              icon: '🌲',
              name: 'Mark Twain National Forest',
              distance: 'On Property',
              desc: 'Over 750 miles of trails for hiking, horseback riding, and mountain biking through the heart of the Ozarks.',
            },
            {
              icon: '🏊',
              name: 'Huzzah Creek',
              distance: '0.5 Miles',
              desc: 'A crystal-clear Ozark stream perfect for floating, swimming, and fishing. Joins the scenic Meramec River.',
            },
            {
              icon: '⛳',
              name: 'Viburnum Country Club',
              distance: 'Nearby',
              desc: 'Scenic golf course with multiple tee lengths, great for beginners and experienced players alike.',
            },
          ].map((item) => (
            <div key={item.name} style={{
              marginBottom: '14px',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                minWidth: '32px',
                background: '#2D5A47',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
              }}>
                {item.icon}
              </div>
              <div>
                <p style={{
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 600,
                  fontSize: '13px',
                  color: '#2D5A47',
                  marginBottom: '1px',
                }}>
                  {item.name}
                  <span style={{
                    fontSize: '10px',
                    color: '#B87333',
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 500,
                    marginLeft: '6px',
                  }}>
                    {item.distance}
                  </span>
                </p>
                <p style={{
                  fontSize: '10.5px',
                  color: '#374151',
                  lineHeight: 1.5,
                }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}

          {/* Bottom quote */}
          <div style={{
            marginTop: 'auto',
            padding: '12px',
            background: '#2D5A47',
            borderRadius: '8px',
            textAlign: 'center',
          }}>
            <p style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontSize: '12px',
              color: '#FAFAF8',
              lineHeight: 1.6,
            }}>
              &ldquo;Located just 100 miles from St. Louis in the scenic Missouri Ozarks&rdquo;
            </p>
          </div>
        </div>

        {/* Panel 3: Front Cover */}
        <div style={{
          width: '33.333%',
          height: '100%',
          background: 'linear-gradient(170deg, #2D5A47 0%, #1a3d2f 60%, #0f2a1e 100%)',
          color: '#FAFAF8',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0.5in 0.4in',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decorative circle elements */}
          <div style={{
            position: 'absolute',
            top: '-40px',
            right: '-40px',
            width: '120px',
            height: '120px',
            border: '1px solid rgba(184, 115, 51, 0.2)',
            borderRadius: '50%',
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-60px',
            left: '-60px',
            width: '180px',
            height: '180px',
            border: '1px solid rgba(122, 158, 142, 0.15)',
            borderRadius: '50%',
          }} />

          {/* Logo / Icon */}
          <div style={{
            width: '80px',
            height: '80px',
            border: '2px solid #B87333',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px',
            fontSize: '36px',
          }}>
            🌿
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '30px',
            fontWeight: 700,
            color: '#FAFAF8',
            lineHeight: 1.15,
            marginBottom: '8px',
            letterSpacing: '-0.01em',
          }}>
            Pine Valley
          </h1>
          <p style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '14px',
            fontWeight: 400,
            color: '#B87333',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginBottom: '24px',
          }}>
            at Dillard Mill
          </p>

          {/* Divider */}
          <div style={{
            width: '50px',
            height: '1px',
            background: '#B87333',
            marginBottom: '24px',
          }} />

          {/* Tagline */}
          <p style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '16px',
            fontStyle: 'italic',
            color: '#FAFAF8',
            lineHeight: 1.6,
            marginBottom: '20px',
            opacity: 0.9,
          }}>
            43 Private Acres in the<br />
            Missouri Ozarks
          </p>

          {/* Features list */}
          <div style={{
            fontSize: '11px',
            color: '#7A9E8E',
            lineHeight: 2.2,
            letterSpacing: '0.05em',
          }}>
            <p>Vintage Glamping&ensp;·&ensp;Cozy Cottages</p>
            <p>Hiking&ensp;·&ensp;Fishing&ensp;·&ensp;Creek Swimming</p>
            <p>Events&ensp;·&ensp;Group Retreats</p>
          </div>

          {/* Bottom accent */}
          <div style={{
            position: 'absolute',
            bottom: '24px',
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
          }}>
            <div style={{ width: '20px', height: '1px', background: '#B87333' }} />
            <span style={{ fontSize: '10px', color: '#7A9E8E', letterSpacing: '0.1em' }}>
              EST. DAVISVILLE, MO
            </span>
            <div style={{ width: '20px', height: '1px', background: '#B87333' }} />
          </div>
        </div>
      </div>

      {/* ===== BACK SIDE (Page 2) ===== */}
      <div
        className="brochure-side"
        style={{
          width: '11in',
          height: '8.5in',
          display: 'flex',
          overflow: 'hidden',
          fontFamily: 'var(--font-sans)',
        }}
      >
        {/* Panel 4: Inside Left — About the Property */}
        <div style={{
          width: '33.333%',
          height: '100%',
          background: '#FAFAF8',
          padding: '0.5in 0.35in',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: 'linear-gradient(to right, #7A9E8E, #2D5A47)',
          }} />

          <div style={{ textAlign: 'center', marginBottom: '20px', marginTop: '8px' }}>
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '20px',
              fontWeight: 600,
              color: '#2D5A47',
              marginBottom: '4px',
            }}>
              Our Story
            </h2>
            <div style={{
              width: '40px',
              height: '2px',
              background: '#B87333',
              margin: '0 auto',
            }} />
          </div>

          <p style={{
            fontSize: '11.5px',
            color: '#374151',
            lineHeight: 1.8,
            marginBottom: '16px',
          }}>
            Nestled in the heart of Mark Twain National Forest,
            Pine Valley at Dillard Mill is a 43-acre private retreat
            just steps from one of Missouri&apos;s most treasured historic
            landmarks — the 1908 Dillard Mill.
          </p>

          <p style={{
            fontSize: '11.5px',
            color: '#374151',
            lineHeight: 1.8,
            marginBottom: '16px',
          }}>
            Our property offers a rare combination of rustic charm
            and modern comfort, where guests can disconnect from
            the everyday and reconnect with nature, family, and
            the simple joys of the Ozarks.
          </p>

          <p style={{
            fontSize: '11.5px',
            color: '#374151',
            lineHeight: 1.8,
            marginBottom: '20px',
          }}>
            Whether you&apos;re seeking a romantic weekend in a vintage
            Airstream, a family gathering at the cottage, or a
            full-property retreat for your group — Pine Valley
            is your home in the forest.
          </p>

          {/* Highlight box */}
          <div style={{
            background: '#2D5A47',
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center',
            marginTop: 'auto',
          }}>
            <p style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '14px',
              fontWeight: 600,
              color: '#B87333',
              marginBottom: '6px',
            }}>
              ★★★★★
            </p>
            <p style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontSize: '12px',
              color: '#FAFAF8',
              lineHeight: 1.6,
            }}>
              &ldquo;An absolutely magical place. We didn&apos;t want to leave.&rdquo;
            </p>
            <p style={{
              fontSize: '10px',
              color: '#7A9E8E',
              marginTop: '6px',
            }}>
              — Recent Guest Review
            </p>
          </div>
        </div>

        {/* Panel 5: Inside Center — Lodging Options */}
        <div style={{
          width: '33.333%',
          height: '100%',
          background: '#FAFAF8',
          padding: '0.5in 0.35in',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          borderLeft: '1px solid #E5E1D8',
          borderRight: '1px solid #E5E1D8',
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: '#B87333',
          }} />

          <div style={{ textAlign: 'center', marginBottom: '20px', marginTop: '8px' }}>
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '20px',
              fontWeight: 600,
              color: '#2D5A47',
              marginBottom: '4px',
            }}>
              Where to Stay
            </h2>
            <div style={{
              width: '40px',
              height: '2px',
              background: '#B87333',
              margin: '0 auto',
            }} />
          </div>

          {/* Lodging cards */}
          {[
            {
              name: 'The Cozy Cottage',
              icon: '🏡',
              desc: 'A charming, fully-equipped cottage perfect for families or couples. Features a full kitchen, comfortable living area, and private outdoor space with soaking tub.',
              capacity: 'Sleeps 4–6',
              color: '#2D5A47',
            },
            {
              name: 'The Airstream',
              icon: '🚐',
              desc: 'A beautifully restored vintage Airstream offering a unique glamping experience. Cozy and intimate with modern amenities surrounded by forest.',
              capacity: 'Sleeps 2',
              color: '#B87333',
            },
            {
              name: 'The Sebastian',
              icon: '🏕️',
              desc: 'Rustic yet refined cabin-style accommodation nestled among the trees. Perfect for those seeking an authentic Ozark retreat.',
              capacity: 'Sleeps 2–4',
              color: '#6B9AC4',
            },
          ].map((unit) => (
            <div key={unit.name} style={{
              marginBottom: '14px',
              padding: '12px',
              border: `1px solid ${unit.color}30`,
              borderRadius: '8px',
              borderLeft: `3px solid ${unit.color}`,
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '6px',
              }}>
                <span style={{ fontSize: '18px' }}>{unit.icon}</span>
                <h3 style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#2D5A47',
                }}>
                  {unit.name}
                </h3>
              </div>
              <p style={{
                fontSize: '10.5px',
                color: '#374151',
                lineHeight: 1.6,
                marginBottom: '4px',
              }}>
                {unit.desc}
              </p>
              <p style={{
                fontSize: '10px',
                color: unit.color,
                fontWeight: 600,
              }}>
                {unit.capacity}
              </p>
            </div>
          ))}

          {/* Book the Farm */}
          <div style={{
            marginTop: 'auto',
            padding: '12px',
            background: 'linear-gradient(135deg, #2D5A47, #1a3d2f)',
            borderRadius: '8px',
            textAlign: 'center',
          }}>
            <h3 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '13px',
              fontWeight: 600,
              color: '#B87333',
              marginBottom: '4px',
            }}>
              Book the Entire Farm
            </h3>
            <p style={{
              fontSize: '10.5px',
              color: '#FAFAF8',
              lineHeight: 1.5,
            }}>
              Host up to 20+ guests for reunions, retreats,
              and celebrations. Café seats 30.
            </p>
          </div>
        </div>

        {/* Panel 6: Inside Right — Activities & Amenities */}
        <div style={{
          width: '33.333%',
          height: '100%',
          background: '#FAFAF8',
          padding: '0.5in 0.35in',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: 'linear-gradient(to right, #2D5A47, #7A9E8E)',
          }} />

          <div style={{ textAlign: 'center', marginBottom: '16px', marginTop: '8px' }}>
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '20px',
              fontWeight: 600,
              color: '#2D5A47',
              marginBottom: '4px',
            }}>
              Things to Do
            </h2>
            <div style={{
              width: '40px',
              height: '2px',
              background: '#B87333',
              margin: '0 auto',
            }} />
          </div>

          {/* Activities grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
            marginBottom: '16px',
          }}>
            {[
              { icon: '🥾', label: 'Hiking Trails', desc: '1.5–2 miles of private trails' },
              { icon: '🎣', label: 'Fishing', desc: 'Two stocked ponds on property' },
              { icon: '🏊', label: 'Creek Swimming', desc: 'Huzzah Creek nearby' },
              { icon: '🔥', label: 'Campfires', desc: 'Multiple fire pit areas' },
              { icon: '🌙', label: 'Stargazing', desc: 'Dark sky paradise' },
              { icon: '🛁', label: 'Soaking Tubs', desc: 'Outdoor clawfoot tubs' },
            ].map((activity) => (
              <div key={activity.label} style={{
                textAlign: 'center',
                padding: '8px 4px',
                background: '#2D5A4708',
                borderRadius: '6px',
              }}>
                <div style={{ fontSize: '20px', marginBottom: '2px' }}>
                  {activity.icon}
                </div>
                <p style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#2D5A47',
                  marginBottom: '1px',
                }}>
                  {activity.label}
                </p>
                <p style={{
                  fontSize: '9px',
                  color: '#374151',
                }}>
                  {activity.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Amenities list */}
          <div style={{
            padding: '12px',
            background: '#2D5A470A',
            borderRadius: '8px',
            marginBottom: '12px',
          }}>
            <h3 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '13px',
              fontWeight: 600,
              color: '#2D5A47',
              marginBottom: '8px',
              textAlign: 'center',
            }}>
              Amenities
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '4px 12px',
              fontSize: '10px',
              color: '#374151',
            }}>
              {[
                '✓ WiFi Available',
                '✓ Pet Friendly',
                '✓ Full Kitchens',
                '✓ RV Hookups',
                '✓ Outdoor Bathhouse',
                '✓ Campfire Wood',
                '✓ Picnic Areas',
                '✓ Private Parking',
              ].map((amenity) => (
                <p key={amenity} style={{ lineHeight: 2 }}>{amenity}</p>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div style={{
            marginTop: 'auto',
            textAlign: 'center',
            padding: '12px',
            background: '#B87333',
            borderRadius: '8px',
          }}>
            <p style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '14px',
              fontWeight: 600,
              color: '#FAFAF8',
              marginBottom: '2px',
            }}>
              Book Your Stay Today
            </p>
            <p style={{
              fontSize: '11px',
              color: '#FAFAF8',
              opacity: 0.9,
            }}>
              dillardmill.com
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
