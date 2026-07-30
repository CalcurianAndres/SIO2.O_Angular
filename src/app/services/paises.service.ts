import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, shareReplay } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

const PROXY_URL = environment.apiUrl + '/external';

interface Pais {
  nombre: string;
  nombreEn: string;
  cca2: string;
  bandera: string;
  prefijo: string;
}

export function getFlagUrl(cca2: string): string {
  return `https://flagcdn.com/w40/${cca2.toLowerCase()}.png`;
}

export const PAISES: Pais[] = (
  [
    { nombre: 'Afganistán', nombreEn: 'Afghanistan', cca2: 'AF', prefijo: '+93' },
    { nombre: 'Albania', nombreEn: 'Albania', cca2: 'AL', prefijo: '+355' },
    { nombre: 'Alemania', nombreEn: 'Germany', cca2: 'DE', prefijo: '+49' },
    { nombre: 'Andorra', nombreEn: 'Andorra', cca2: 'AD', prefijo: '+376' },
    { nombre: 'Angola', nombreEn: 'Angola', cca2: 'AO', prefijo: '+244' },
    { nombre: 'Antigua y Barbuda', nombreEn: 'Antigua and Barbuda', cca2: 'AG', prefijo: '+1268' },
    { nombre: 'Arabia Saudita', nombreEn: 'Saudi Arabia', cca2: 'SA', prefijo: '+966' },
    { nombre: 'Argelia', nombreEn: 'Algeria', cca2: 'DZ', prefijo: '+213' },
    { nombre: 'Argentina', nombreEn: 'Argentina', cca2: 'AR', prefijo: '+54' },
    { nombre: 'Armenia', nombreEn: 'Armenia', cca2: 'AM', prefijo: '+374' },
    { nombre: 'Australia', nombreEn: 'Australia', cca2: 'AU', prefijo: '+61' },
    { nombre: 'Austria', nombreEn: 'Austria', cca2: 'AT', prefijo: '+43' },
    { nombre: 'Azerbaiyán', nombreEn: 'Azerbaijan', cca2: 'AZ', prefijo: '+994' },
    { nombre: 'Bahamas', nombreEn: 'Bahamas', cca2: 'BS', prefijo: '+1242' },
    { nombre: 'Bangladés', nombreEn: 'Bangladesh', cca2: 'BD', prefijo: '+880' },
    { nombre: 'Barbados', nombreEn: 'Barbados', cca2: 'BB', prefijo: '+1246' },
    { nombre: 'Bélgica', nombreEn: 'Belgium', cca2: 'BE', prefijo: '+32' },
    { nombre: 'Belice', nombreEn: 'Belize', cca2: 'BZ', prefijo: '+501' },
    { nombre: 'Benín', nombreEn: 'Benin', cca2: 'BJ', prefijo: '+229' },
    { nombre: 'Bielorrusia', nombreEn: 'Belarus', cca2: 'BY', prefijo: '+375' },
    { nombre: 'Bolivia', nombreEn: 'Bolivia', cca2: 'BO', prefijo: '+591' },
    { nombre: 'Bosnia y Herzegovina', nombreEn: 'Bosnia and Herzegovina', cca2: 'BA', prefijo: '+387' },
    { nombre: 'Botsuana', nombreEn: 'Botswana', cca2: 'BW', prefijo: '+267' },
    { nombre: 'Brasil', nombreEn: 'Brazil', cca2: 'BR', prefijo: '+55' },
    { nombre: 'Brunéi', nombreEn: 'Brunei', cca2: 'BN', prefijo: '+673' },
    { nombre: 'Bulgaria', nombreEn: 'Bulgaria', cca2: 'BG', prefijo: '+359' },
    { nombre: 'Burkina Faso', nombreEn: 'Burkina Faso', cca2: 'BF', prefijo: '+226' },
    { nombre: 'Burundi', nombreEn: 'Burundi', cca2: 'BI', prefijo: '+257' },
    { nombre: 'Bután', nombreEn: 'Bhutan', cca2: 'BT', prefijo: '+975' },
    { nombre: 'Cabo Verde', nombreEn: 'Cape Verde', cca2: 'CV', prefijo: '+238' },
    { nombre: 'Camboya', nombreEn: 'Cambodia', cca2: 'KH', prefijo: '+855' },
    { nombre: 'Camerún', nombreEn: 'Cameroon', cca2: 'CM', prefijo: '+237' },
    { nombre: 'Canadá', nombreEn: 'Canada', cca2: 'CA', prefijo: '+1' },
    { nombre: 'Chad', nombreEn: 'Chad', cca2: 'TD', prefijo: '+235' },
    { nombre: 'Chile', nombreEn: 'Chile', cca2: 'CL', prefijo: '+56' },
    { nombre: 'China', nombreEn: 'China', cca2: 'CN', prefijo: '+86' },
    { nombre: 'Chipre', nombreEn: 'Cyprus', cca2: 'CY', prefijo: '+357' },
    { nombre: 'Colombia', nombreEn: 'Colombia', cca2: 'CO', prefijo: '+57' },
    { nombre: 'Comoras', nombreEn: 'Comoros', cca2: 'KM', prefijo: '+269' },
    { nombre: 'Congo', nombreEn: 'Congo', cca2: 'CG', prefijo: '+242' },
    { nombre: 'Corea del Norte', nombreEn: 'North Korea', cca2: 'KP', prefijo: '+850' },
    { nombre: 'Corea del Sur', nombreEn: 'South Korea', cca2: 'KR', prefijo: '+82' },
    { nombre: 'Costa de Marfil', nombreEn: 'Ivory Coast', cca2: 'CI', prefijo: '+225' },
    { nombre: 'Costa Rica', nombreEn: 'Costa Rica', cca2: 'CR', prefijo: '+506' },
    { nombre: 'Croacia', nombreEn: 'Croatia', cca2: 'HR', prefijo: '+385' },
    { nombre: 'Cuba', nombreEn: 'Cuba', cca2: 'CU', prefijo: '+53' },
    { nombre: 'Dinamarca', nombreEn: 'Denmark', cca2: 'DK', prefijo: '+45' },
    { nombre: 'Dominica', nombreEn: 'Dominica', cca2: 'DM', prefijo: '+1767' },
    { nombre: 'Ecuador', nombreEn: 'Ecuador', cca2: 'EC', prefijo: '+593' },
    { nombre: 'Egipto', nombreEn: 'Egypt', cca2: 'EG', prefijo: '+20' },
    { nombre: 'El Salvador', nombreEn: 'El Salvador', cca2: 'SV', prefijo: '+503' },
    { nombre: 'Emiratos Árabes Unidos', nombreEn: 'United Arab Emirates', cca2: 'AE', prefijo: '+971' },
    { nombre: 'Eritrea', nombreEn: 'Eritrea', cca2: 'ER', prefijo: '+291' },
    { nombre: 'Eslovaquia', nombreEn: 'Slovakia', cca2: 'SK', prefijo: '+421' },
    { nombre: 'Eslovenia', nombreEn: 'Slovenia', cca2: 'SI', prefijo: '+386' },
    { nombre: 'España', nombreEn: 'Spain', cca2: 'ES', prefijo: '+34' },
    { nombre: 'Estados Unidos', nombreEn: 'United States', cca2: 'US', prefijo: '+1' },
    { nombre: 'Estonia', nombreEn: 'Estonia', cca2: 'EE', prefijo: '+372' },
    { nombre: 'Etiopía', nombreEn: 'Ethiopia', cca2: 'ET', prefijo: '+251' },
    { nombre: 'Filipinas', nombreEn: 'Philippines', cca2: 'PH', prefijo: '+63' },
    { nombre: 'Finlandia', nombreEn: 'Finland', cca2: 'FI', prefijo: '+358' },
    { nombre: 'Fiyi', nombreEn: 'Fiji', cca2: 'FJ', prefijo: '+679' },
    { nombre: 'Francia', nombreEn: 'France', cca2: 'FR', prefijo: '+33' },
    { nombre: 'Gabón', nombreEn: 'Gabon', cca2: 'GA', prefijo: '+241' },
    { nombre: 'Gambia', nombreEn: 'Gambia', cca2: 'GM', prefijo: '+220' },
    { nombre: 'Georgia', nombreEn: 'Georgia', cca2: 'GE', prefijo: '+995' },
    { nombre: 'Ghana', nombreEn: 'Ghana', cca2: 'GH', prefijo: '+233' },
    { nombre: 'Granada', nombreEn: 'Grenada', cca2: 'GD', prefijo: '+1473' },
    { nombre: 'Grecia', nombreEn: 'Greece', cca2: 'GR', prefijo: '+30' },
    { nombre: 'Guatemala', nombreEn: 'Guatemala', cca2: 'GT', prefijo: '+502' },
    { nombre: 'Guinea', nombreEn: 'Guinea', cca2: 'GN', prefijo: '+224' },
    { nombre: 'Guinea Ecuatorial', nombreEn: 'Equatorial Guinea', cca2: 'GQ', prefijo: '+240' },
    { nombre: 'Guinea-Bisáu', nombreEn: 'Guinea-Bissau', cca2: 'GW', prefijo: '+245' },
    { nombre: 'Guyana', nombreEn: 'Guyana', cca2: 'GY', prefijo: '+592' },
    { nombre: 'Haití', nombreEn: 'Haiti', cca2: 'HT', prefijo: '+509' },
    { nombre: 'Honduras', nombreEn: 'Honduras', cca2: 'HN', prefijo: '+504' },
    { nombre: 'Hungría', nombreEn: 'Hungary', cca2: 'HU', prefijo: '+36' },
    { nombre: 'India', nombreEn: 'India', cca2: 'IN', prefijo: '+91' },
    { nombre: 'Indonesia', nombreEn: 'Indonesia', cca2: 'ID', prefijo: '+62' },
    { nombre: 'Irak', nombreEn: 'Iraq', cca2: 'IQ', prefijo: '+964' },
    { nombre: 'Irán', nombreEn: 'Iran', cca2: 'IR', prefijo: '+98' },
    { nombre: 'Irlanda', nombreEn: 'Ireland', cca2: 'IE', prefijo: '+353' },
    { nombre: 'Islandia', nombreEn: 'Iceland', cca2: 'IS', prefijo: '+354' },
    { nombre: 'Islas Marshall', nombreEn: 'Marshall Islands', cca2: 'MH', prefijo: '+692' },
    { nombre: 'Islas Salomón', nombreEn: 'Solomon Islands', cca2: 'SB', prefijo: '+677' },
    { nombre: 'Israel', nombreEn: 'Israel', cca2: 'IL', prefijo: '+972' },
    { nombre: 'Italia', nombreEn: 'Italy', cca2: 'IT', prefijo: '+39' },
    { nombre: 'Jamaica', nombreEn: 'Jamaica', cca2: 'JM', prefijo: '+1876' },
    { nombre: 'Japón', nombreEn: 'Japan', cca2: 'JP', prefijo: '+81' },
    { nombre: 'Jordania', nombreEn: 'Jordan', cca2: 'JO', prefijo: '+962' },
    { nombre: 'Kazajistán', nombreEn: 'Kazakhstan', cca2: 'KZ', prefijo: '+7' },
    { nombre: 'Kenia', nombreEn: 'Kenya', cca2: 'KE', prefijo: '+254' },
    { nombre: 'Kirguistán', nombreEn: 'Kyrgyzstan', cca2: 'KG', prefijo: '+996' },
    { nombre: 'Kiribati', nombreEn: 'Kiribati', cca2: 'KI', prefijo: '+686' },
    { nombre: 'Kuwait', nombreEn: 'Kuwait', cca2: 'KW', prefijo: '+965' },
    { nombre: 'Laos', nombreEn: 'Laos', cca2: 'LA', prefijo: '+856' },
    { nombre: 'Lesoto', nombreEn: 'Lesotho', cca2: 'LS', prefijo: '+266' },
    { nombre: 'Letonia', nombreEn: 'Latvia', cca2: 'LV', prefijo: '+371' },
    { nombre: 'Líbano', nombreEn: 'Lebanon', cca2: 'LB', prefijo: '+961' },
    { nombre: 'Liberia', nombreEn: 'Liberia', cca2: 'LR', prefijo: '+231' },
    { nombre: 'Libia', nombreEn: 'Libya', cca2: 'LY', prefijo: '+218' },
    { nombre: 'Liechtenstein', nombreEn: 'Liechtenstein', cca2: 'LI', prefijo: '+423' },
    { nombre: 'Lituania', nombreEn: 'Lithuania', cca2: 'LT', prefijo: '+370' },
    { nombre: 'Luxemburgo', nombreEn: 'Luxembourg', cca2: 'LU', prefijo: '+352' },
    { nombre: 'Madagascar', nombreEn: 'Madagascar', cca2: 'MG', prefijo: '+261' },
    { nombre: 'Malasia', nombreEn: 'Malaysia', cca2: 'MY', prefijo: '+60' },
    { nombre: 'Malaui', nombreEn: 'Malawi', cca2: 'MW', prefijo: '+265' },
    { nombre: 'Maldivas', nombreEn: 'Maldives', cca2: 'MV', prefijo: '+960' },
    { nombre: 'Malí', nombreEn: 'Mali', cca2: 'ML', prefijo: '+223' },
    { nombre: 'Malta', nombreEn: 'Malta', cca2: 'MT', prefijo: '+356' },
    { nombre: 'Marruecos', nombreEn: 'Morocco', cca2: 'MA', prefijo: '+212' },
    { nombre: 'Mauricio', nombreEn: 'Mauritius', cca2: 'MU', prefijo: '+230' },
    { nombre: 'Mauritania', nombreEn: 'Mauritania', cca2: 'MR', prefijo: '+222' },
    { nombre: 'México', nombreEn: 'Mexico', cca2: 'MX', prefijo: '+52' },
    { nombre: 'Micronesia', nombreEn: 'Micronesia', cca2: 'FM', prefijo: '+691' },
    { nombre: 'Moldavia', nombreEn: 'Moldova', cca2: 'MD', prefijo: '+373' },
    { nombre: 'Mónaco', nombreEn: 'Monaco', cca2: 'MC', prefijo: '+377' },
    { nombre: 'Mongolia', nombreEn: 'Mongolia', cca2: 'MN', prefijo: '+976' },
    { nombre: 'Montenegro', nombreEn: 'Montenegro', cca2: 'ME', prefijo: '+382' },
    { nombre: 'Mozambique', nombreEn: 'Mozambique', cca2: 'MZ', prefijo: '+258' },
    { nombre: 'Myanmar', nombreEn: 'Myanmar', cca2: 'MM', prefijo: '+95' },
    { nombre: 'Namibia', nombreEn: 'Namibia', cca2: 'NA', prefijo: '+264' },
    { nombre: 'Nauru', nombreEn: 'Nauru', cca2: 'NR', prefijo: '+674' },
    { nombre: 'Nepal', nombreEn: 'Nepal', cca2: 'NP', prefijo: '+977' },
    { nombre: 'Nicaragua', nombreEn: 'Nicaragua', cca2: 'NI', prefijo: '+505' },
    { nombre: 'Níger', nombreEn: 'Niger', cca2: 'NE', prefijo: '+227' },
    { nombre: 'Nigeria', nombreEn: 'Nigeria', cca2: 'NG', prefijo: '+234' },
    { nombre: 'Noruega', nombreEn: 'Norway', cca2: 'NO', prefijo: '+47' },
    { nombre: 'Nueva Zelanda', nombreEn: 'New Zealand', cca2: 'NZ', prefijo: '+64' },
    { nombre: 'Omán', nombreEn: 'Oman', cca2: 'OM', prefijo: '+968' },
    { nombre: 'Países Bajos', nombreEn: 'Netherlands', cca2: 'NL', prefijo: '+31' },
    { nombre: 'Pakistán', nombreEn: 'Pakistan', cca2: 'PK', prefijo: '+92' },
    { nombre: 'Palaos', nombreEn: 'Palau', cca2: 'PW', prefijo: '+680' },
    { nombre: 'Panamá', nombreEn: 'Panama', cca2: 'PA', prefijo: '+507' },
    { nombre: 'Papúa Nueva Guinea', nombreEn: 'Papua New Guinea', cca2: 'PG', prefijo: '+675' },
    { nombre: 'Paraguay', nombreEn: 'Paraguay', cca2: 'PY', prefijo: '+595' },
    { nombre: 'Perú', nombreEn: 'Peru', cca2: 'PE', prefijo: '+51' },
    { nombre: 'Polonia', nombreEn: 'Poland', cca2: 'PL', prefijo: '+48' },
    { nombre: 'Portugal', nombreEn: 'Portugal', cca2: 'PT', prefijo: '+351' },
    { nombre: 'Qatar', nombreEn: 'Qatar', cca2: 'QA', prefijo: '+974' },
    { nombre: 'Reino Unido', nombreEn: 'United Kingdom', cca2: 'GB', prefijo: '+44' },
    { nombre: 'República Centroafricana', nombreEn: 'Central African Republic', cca2: 'CF', prefijo: '+236' },
    { nombre: 'República Checa', nombreEn: 'Czech Republic', cca2: 'CZ', prefijo: '+420' },
    {
      nombre: 'República Democrática del Congo',
      nombreEn: 'Democratic Republic of the Congo',
      cca2: 'CD',
      prefijo: '+243',
    },
    { nombre: 'República Dominicana', nombreEn: 'Dominican Republic', cca2: 'DO', prefijo: '+1809' },
    { nombre: 'Ruanda', nombreEn: 'Rwanda', cca2: 'RW', prefijo: '+250' },
    { nombre: 'Rumania', nombreEn: 'Romania', cca2: 'RO', prefijo: '+40' },
    { nombre: 'Rusia', nombreEn: 'Russia', cca2: 'RU', prefijo: '+7' },
    { nombre: 'Samoa', nombreEn: 'Samoa', cca2: 'WS', prefijo: '+685' },
    { nombre: 'San Cristóbal y Nieves', nombreEn: 'Saint Kitts and Nevis', cca2: 'KN', prefijo: '+1869' },
    { nombre: 'San Marino', nombreEn: 'San Marino', cca2: 'SM', prefijo: '+378' },
    {
      nombre: 'San Vicente y las Granadinas',
      nombreEn: 'Saint Vincent and the Grenadines',
      cca2: 'VC',
      prefijo: '+1784',
    },
    { nombre: 'Santa Lucía', nombreEn: 'Saint Lucia', cca2: 'LC', prefijo: '+1758' },
    { nombre: 'Santo Tomé y Príncipe', nombreEn: 'Sao Tome and Principe', cca2: 'ST', prefijo: '+239' },
    { nombre: 'Senegal', nombreEn: 'Senegal', cca2: 'SN', prefijo: '+221' },
    { nombre: 'Serbia', nombreEn: 'Serbia', cca2: 'RS', prefijo: '+381' },
    { nombre: 'Seychelles', nombreEn: 'Seychelles', cca2: 'SC', prefijo: '+248' },
    { nombre: 'Sierra Leona', nombreEn: 'Sierra Leone', cca2: 'SL', prefijo: '+232' },
    { nombre: 'Singapur', nombreEn: 'Singapore', cca2: 'SG', prefijo: '+65' },
    { nombre: 'Siria', nombreEn: 'Syria', cca2: 'SY', prefijo: '+963' },
    { nombre: 'Somalia', nombreEn: 'Somalia', cca2: 'SO', prefijo: '+252' },
    { nombre: 'Sri Lanka', nombreEn: 'Sri Lanka', cca2: 'LK', prefijo: '+94' },
    { nombre: 'Suazilandia', nombreEn: 'Eswatini', cca2: 'SZ', prefijo: '+268' },
    { nombre: 'Sudáfrica', nombreEn: 'South Africa', cca2: 'ZA', prefijo: '+27' },
    { nombre: 'Sudán', nombreEn: 'Sudan', cca2: 'SD', prefijo: '+249' },
    { nombre: 'Sudán del Sur', nombreEn: 'South Sudan', cca2: 'SS', prefijo: '+211' },
    { nombre: 'Suecia', nombreEn: 'Sweden', cca2: 'SE', prefijo: '+46' },
    { nombre: 'Suiza', nombreEn: 'Switzerland', cca2: 'CH', prefijo: '+41' },
    { nombre: 'Surinam', nombreEn: 'Suriname', cca2: 'SR', prefijo: '+597' },
    { nombre: 'Tailandia', nombreEn: 'Thailand', cca2: 'TH', prefijo: '+66' },
    { nombre: 'Taiwán', nombreEn: 'Taiwan', cca2: 'TW', prefijo: '+886' },
    { nombre: 'Tanzania', nombreEn: 'Tanzania', cca2: 'TZ', prefijo: '+255' },
    { nombre: 'Tayikistán', nombreEn: 'Tajikistan', cca2: 'TJ', prefijo: '+992' },
    { nombre: 'Timor Oriental', nombreEn: 'East Timor', cca2: 'TL', prefijo: '+670' },
    { nombre: 'Togo', nombreEn: 'Togo', cca2: 'TG', prefijo: '+228' },
    { nombre: 'Tonga', nombreEn: 'Tonga', cca2: 'TO', prefijo: '+676' },
    { nombre: 'Trinidad y Tobago', nombreEn: 'Trinidad and Tobago', cca2: 'TT', prefijo: '+1868' },
    { nombre: 'Túnez', nombreEn: 'Tunisia', cca2: 'TN', prefijo: '+216' },
    { nombre: 'Turkmenistán', nombreEn: 'Turkmenistan', cca2: 'TM', prefijo: '+993' },
    { nombre: 'Turquía', nombreEn: 'Turkey', cca2: 'TR', prefijo: '+90' },
    { nombre: 'Tuvalu', nombreEn: 'Tuvalu', cca2: 'TV', prefijo: '+688' },
    { nombre: 'Ucrania', nombreEn: 'Ukraine', cca2: 'UA', prefijo: '+380' },
    { nombre: 'Uganda', nombreEn: 'Uganda', cca2: 'UG', prefijo: '+256' },
    { nombre: 'Uruguay', nombreEn: 'Uruguay', cca2: 'UY', prefijo: '+598' },
    { nombre: 'Uzbekistán', nombreEn: 'Uzbekistan', cca2: 'UZ', prefijo: '+998' },
    { nombre: 'Vanuatu', nombreEn: 'Vanuatu', cca2: 'VU', prefijo: '+678' },
    { nombre: 'Vaticano', nombreEn: 'Vatican City', cca2: 'VA', prefijo: '+379' },
    { nombre: 'Venezuela', nombreEn: 'Venezuela', cca2: 'VE', prefijo: '+58' },
    { nombre: 'Vietnam', nombreEn: 'Vietnam', cca2: 'VN', prefijo: '+84' },
    { nombre: 'Yemen', nombreEn: 'Yemen', cca2: 'YE', prefijo: '+967' },
    { nombre: 'Yibuti', nombreEn: 'Djibouti', cca2: 'DJ', prefijo: '+253' },
    { nombre: 'Zambia', nombreEn: 'Zambia', cca2: 'ZM', prefijo: '+260' },
    { nombre: 'Zimbabue', nombreEn: 'Zimbabwe', cca2: 'ZW', prefijo: '+263' },
  ] as Pais[]
).map((p) => ({ ...p, bandera: getFlagUrl(p.cca2) }));

@Injectable({
  providedIn: 'root',
})
export class PaisesService {
  private estadosCache = new Map<string, Observable<string[]>>();

  constructor(private http: HttpClient) {}

  getPaises(): Observable<{ nombre: string; nombreEn: string }[]> {
    return of(PAISES.map((p) => ({ nombre: p.nombre, nombreEn: p.nombreEn })));
  }

  getEstados(pais: string): Observable<string[]> {
    if (this.estadosCache.has(pais)) {
      return this.estadosCache.get(pais)!;
    }
    const request = this.http
      .post<any>(
        PROXY_URL,
        { country: pais },
        {
          params: { url: 'https://countriesnow.space/api/v0.1/countries/states' },
        },
      )
      .pipe(
        map((res) => res?.data?.states?.map((s: any) => s.name) || []),
        catchError(() => of([])),
        shareReplay(1),
      );
    this.estadosCache.set(pais, request);
    return request;
  }

  detectarPaisPorPrefijo(
    phone: string,
  ): Observable<{ nombre: string; bandera: string; codigo: string; cca2: string } | null> {
    if (!phone || !phone.startsWith('+')) return of(null);
    const detected = PAISES.find((p) => phone.startsWith(p.prefijo));
    if (!detected) return of(null);
    return of({
      nombre: detected.nombreEn,
      codigo: detected.prefijo,
      bandera: detected.bandera,
      cca2: detected.cca2,
    });
  }
}
