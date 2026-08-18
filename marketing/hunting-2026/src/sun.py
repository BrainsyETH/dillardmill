import math, datetime
LAT, LON, TZ = 37.7241, -91.2061, -6  # CST, DST ends Nov 1 2026

def jday(y,m,d):
    if m<=2: y-=1; m+=12
    a=y//100; b=2-a+a//4
    return int(365.25*(y+4716))+int(30.6001*(m+1))+d+b-1524.5

def solar(y,mo,d,zenith):
    """Return (rise, set) local decimal hours for given zenith angle."""
    jd=jday(y,mo,d); out=[]
    for is_rise in (True,False):
        t=(jd-2451545.0)/36525.0
        # iterate to converge
        approx=jd + ((6 if is_rise else 18)/24.0) - LON/360.0
        for _ in range(3):
            t=(approx-2451545.0)/36525.0
            L=(280.46646+t*(36000.76983+t*0.0003032))%360
            M=357.52911+t*(35999.05029-0.0001537*t)
            e=0.016708634-t*(0.000042037+0.0000001267*t)
            Mr=math.radians(M)
            C=(math.sin(Mr)*(1.914602-t*(0.004817+0.000014*t))
               +math.sin(2*Mr)*(0.019993-0.000101*t)+math.sin(3*Mr)*0.000289)
            true_long=L+C
            omega=125.04-1934.136*t
            lam=math.radians(true_long-0.00569-0.00478*math.sin(math.radians(omega)))
            eps=23+(26+((21.448-t*(46.815+t*(0.00059-t*0.001813))))/60)/60
            eps_c=math.radians(eps+0.00256*math.cos(math.radians(omega)))
            decl=math.asin(math.sin(eps_c)*math.sin(lam))
            y_=math.tan(eps_c/2)**2
            eot=4*math.degrees(y_*math.sin(2*math.radians(L))-2*e*math.sin(Mr)
                +4*e*y_*math.sin(Mr)*math.cos(2*math.radians(L))
                -0.5*y_*y_*math.sin(4*math.radians(L))-1.25*e*e*math.sin(2*Mr))
            cosH=((math.cos(math.radians(zenith))
                   -math.sin(math.radians(LAT))*math.sin(decl))
                  /(math.cos(math.radians(LAT))*math.cos(decl)))
            if abs(cosH)>1: return (None,None)
            H=math.degrees(math.acos(cosH))
            if is_rise: H=-H
            approx=jd+(720-4*(LON+H)-eot)/1440.0
        out.append(((approx-jd)*24+TZ)%24)
    return (out[1], out[0])  # (sunrise, sunset)

def hm(x):
    h=int(x); m=int(round((x-h)*60))
    if m==60: h,m=h+1,0
    return f"{h:02d}:{m:02d}"

print(f"{'DATE':<14}{'SUNRISE':>9}{'SUNSET':>9}   {'LEGAL LIGHT (MO: -30/+30)':>28}")
for d in (13,14,15,16,20,21,22):
    r,s=solar(2026,11,d,90.833)
    lo,hi=hm(r-0.5),hm(s+0.5)
    dt=datetime.date(2026,11,d)
    print(f"{dt.strftime('%a %b %d'):<14}{hm(r):>9}{hm(s):>9}   {lo+' - '+hi:>28}")
