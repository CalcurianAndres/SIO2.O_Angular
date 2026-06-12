import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, shareReplay } from 'rxjs/operators';

const PROXY_URL = '/api/external';

interface Pais {
  nombre: string;
  nombreEn: string;
  cca2: string;
  bandera: string;
  prefijo: string;
}

const PAISES: Pais[] = [
  { nombre: 'Afganistán', nombreEn: 'Afghanistan', cca2: 'AF', bandera: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Flag_of_the_Taliban.svg', prefijo: '+93' },
  { nombre: 'Albania', nombreEn: 'Albania', cca2: 'AL', bandera: 'https://upload.wikimedia.org/wikipedia/commons/3/36/Flag_of_Albania.svg', prefijo: '+355' },
  { nombre: 'Alemania', nombreEn: 'Germany', cca2: 'DE', bandera: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Flag_of_Germany.svg', prefijo: '+49' },
  { nombre: 'Andorra', nombreEn: 'Andorra', cca2: 'AD', bandera: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Flag_of_Andorra.svg', prefijo: '+376' },
  { nombre: 'Angola', nombreEn: 'Angola', cca2: 'AO', bandera: 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Flag_of_Angola.svg', prefijo: '+244' },
  { nombre: 'Antigua y Barbuda', nombreEn: 'Antigua and Barbuda', cca2: 'AG', bandera: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Flag_of_Antigua_and_Barbuda.svg', prefijo: '+1268' },
  { nombre: 'Arabia Saudita', nombreEn: 'Saudi Arabia', cca2: 'SA', bandera: 'https://upload.wikimedia.org/wikipedia/commons/0/0d/Flag_of_Saudi_Arabia.svg', prefijo: '+966' },
  { nombre: 'Argelia', nombreEn: 'Algeria', cca2: 'DZ', bandera: 'https://upload.wikimedia.org/wikipedia/commons/7/77/Flag_of_Algeria.svg', prefijo: '+213' },
  { nombre: 'Argentina', nombreEn: 'Argentina', cca2: 'AR', bandera: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Flag_of_Argentina.svg', prefijo: '+54' },
  { nombre: 'Armenia', nombreEn: 'Armenia', cca2: 'AM', bandera: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Flag_of_Armenia.svg', prefijo: '+374' },
  { nombre: 'Australia', nombreEn: 'Australia', cca2: 'AU', bandera: 'https://upload.wikimedia.org/wikipedia/commons/8/88/Flag_of_Australia_%28converted%29.svg', prefijo: '+61' },
  { nombre: 'Austria', nombreEn: 'Austria', cca2: 'AT', bandera: 'https://upload.wikimedia.org/wikipedia/commons/4/41/Flag_of_Austria.svg', prefijo: '+43' },
  { nombre: 'Azerbaiyán', nombreEn: 'Azerbaijan', cca2: 'AZ', bandera: 'https://upload.wikimedia.org/wikipedia/commons/d/dd/Flag_of_Azerbaijan.svg', prefijo: '+994' },
  { nombre: 'Bahamas', nombreEn: 'Bahamas', cca2: 'BS', bandera: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Flag_of_the_Bahamas.svg', prefijo: '+1242' },
  { nombre: 'Bangladés', nombreEn: 'Bangladesh', cca2: 'BD', bandera: 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Flag_of_Bangladesh.svg', prefijo: '+880' },
  { nombre: 'Barbados', nombreEn: 'Barbados', cca2: 'BB', bandera: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Flag_of_Barbados.svg', prefijo: '+1246' },
  { nombre: 'Bélgica', nombreEn: 'Belgium', cca2: 'BE', bandera: 'https://upload.wikimedia.org/wikipedia/commons/6/65/Flag_of_Belgium.svg', prefijo: '+32' },
  { nombre: 'Belice', nombreEn: 'Belize', cca2: 'BZ', bandera: 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Flag_of_Belize.svg', prefijo: '+501' },
  { nombre: 'Benín', nombreEn: 'Benin', cca2: 'BJ', bandera: 'https://upload.wikimedia.org/wikipedia/commons/0/0a/Flag_of_Benin.svg', prefijo: '+229' },
  { nombre: 'Bielorrusia', nombreEn: 'Belarus', cca2: 'BY', bandera: 'https://upload.wikimedia.org/wikipedia/commons/8/85/Flag_of_Belarus.svg', prefijo: '+375' },
  { nombre: 'Bolivia', nombreEn: 'Bolivia', cca2: 'BO', bandera: 'https://upload.wikimedia.org/wikipedia/commons/4/48/Flag_of_Bolivia.svg', prefijo: '+591' },
  { nombre: 'Bosnia y Herzegovina', nombreEn: 'Bosnia and Herzegovina', cca2: 'BA', bandera: 'https://upload.wikimedia.org/wikipedia/commons/b/bf/Flag_of_Bosnia_and_Herzegovina.svg', prefijo: '+387' },
  { nombre: 'Botsuana', nombreEn: 'Botswana', cca2: 'BW', bandera: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Flag_of_Botswana.svg', prefijo: '+267' },
  { nombre: 'Brasil', nombreEn: 'Brazil', cca2: 'BR', bandera: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Flag_of_Brazil.svg', prefijo: '+55' },
  { nombre: 'Brunéi', nombreEn: 'Brunei', cca2: 'BN', bandera: 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Flag_of_Brunei.svg', prefijo: '+673' },
  { nombre: 'Bulgaria', nombreEn: 'Bulgaria', cca2: 'BG', bandera: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Flag_of_Bulgaria.svg', prefijo: '+359' },
  { nombre: 'Burkina Faso', nombreEn: 'Burkina Faso', cca2: 'BF', bandera: 'https://upload.wikimedia.org/wikipedia/commons/3/31/Flag_of_Burkina_Faso.svg', prefijo: '+226' },
  { nombre: 'Burundi', nombreEn: 'Burundi', cca2: 'BI', bandera: 'https://upload.wikimedia.org/wikipedia/commons/5/50/Flag_of_Burundi.svg', prefijo: '+257' },
  { nombre: 'Bután', nombreEn: 'Bhutan', cca2: 'BT', bandera: 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Flag_of_Bhutan.svg', prefijo: '+975' },
  { nombre: 'Cabo Verde', nombreEn: 'Cape Verde', cca2: 'CV', bandera: 'https://upload.wikimedia.org/wikipedia/commons/3/38/Flag_of_Cape_Verde.svg', prefijo: '+238' },
  { nombre: 'Camboya', nombreEn: 'Cambodia', cca2: 'KH', bandera: 'https://upload.wikimedia.org/wikipedia/commons/8/83/Flag_of_Cambodia.svg', prefijo: '+855' },
  { nombre: 'Camerún', nombreEn: 'Cameroon', cca2: 'CM', bandera: 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Flag_of_Cameroon.svg', prefijo: '+237' },
  { nombre: 'Canadá', nombreEn: 'Canada', cca2: 'CA', bandera: 'https://upload.wikimedia.org/wikipedia/commons/c/cf/Flag_of_Canada.svg', prefijo: '+1' },
  { nombre: 'Chad', nombreEn: 'Chad', cca2: 'TD', bandera: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Flag_of_Chad.svg', prefijo: '+235' },
  { nombre: 'Chile', nombreEn: 'Chile', cca2: 'CL', bandera: 'https://upload.wikimedia.org/wikipedia/commons/7/78/Flag_of_Chile.svg', prefijo: '+56' },
  { nombre: 'China', nombreEn: 'China', cca2: 'CN', bandera: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Flag_of_the_People%27s_Republic_of_China.svg', prefijo: '+86' },
  { nombre: 'Chipre', nombreEn: 'Cyprus', cca2: 'CY', bandera: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Flag_of_Cyprus.svg', prefijo: '+357' },
  { nombre: 'Colombia', nombreEn: 'Colombia', cca2: 'CO', bandera: 'https://upload.wikimedia.org/wikipedia/commons/2/21/Flag_of_Colombia.svg', prefijo: '+57' },
  { nombre: 'Comoras', nombreEn: 'Comoros', cca2: 'KM', bandera: 'https://upload.wikimedia.org/wikipedia/commons/9/94/Flag_of_the_Comoros.svg', prefijo: '+269' },
  { nombre: 'Congo', nombreEn: 'Congo', cca2: 'CG', bandera: 'https://upload.wikimedia.org/wikipedia/commons/9/92/Flag_of_the_Republic_of_the_Congo.svg', prefijo: '+242' },
  { nombre: 'Corea del Norte', nombreEn: 'North Korea', cca2: 'KP', bandera: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Flag_of_North_Korea.svg', prefijo: '+850' },
  { nombre: 'Corea del Sur', nombreEn: 'South Korea', cca2: 'KR', bandera: 'https://upload.wikimedia.org/wikipedia/commons/0/09/Flag_of_South_Korea.svg', prefijo: '+82' },
  { nombre: 'Costa de Marfil', nombreEn: 'Ivory Coast', cca2: 'CI', bandera: 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Flag_of_C%C3%B4te_d%27Ivoire.svg', prefijo: '+225' },
  { nombre: 'Costa Rica', nombreEn: 'Costa Rica', cca2: 'CR', bandera: 'https://upload.wikimedia.org/wikipedia/commons/f/f2/Flag_of_Costa_Rica.svg', prefijo: '+506' },
  { nombre: 'Croacia', nombreEn: 'Croatia', cca2: 'HR', bandera: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/Flag_of_Croatia.svg', prefijo: '+385' },
  { nombre: 'Cuba', nombreEn: 'Cuba', cca2: 'CU', bandera: 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Flag_of_Cuba.svg', prefijo: '+53' },
  { nombre: 'Dinamarca', nombreEn: 'Denmark', cca2: 'DK', bandera: 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Flag_of_Denmark.svg', prefijo: '+45' },
  { nombre: 'Dominica', nombreEn: 'Dominica', cca2: 'DM', bandera: 'https://upload.wikimedia.org/wikipedia/commons/c/c4/Flag_of_Dominica.svg', prefijo: '+1767' },
  { nombre: 'Ecuador', nombreEn: 'Ecuador', cca2: 'EC', bandera: 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Flag_of_Ecuador.svg', prefijo: '+593' },
  { nombre: 'Egipto', nombreEn: 'Egypt', cca2: 'EG', bandera: 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Flag_of_Egypt.svg', prefijo: '+20' },
  { nombre: 'El Salvador', nombreEn: 'El Salvador', cca2: 'SV', bandera: 'https://upload.wikimedia.org/wikipedia/commons/3/34/Flag_of_El_Salvador.svg', prefijo: '+503' },
  { nombre: 'Emiratos Árabes Unidos', nombreEn: 'United Arab Emirates', cca2: 'AE', bandera: 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Flag_of_the_United_Arab_Emirates.svg', prefijo: '+971' },
  { nombre: 'Eritrea', nombreEn: 'Eritrea', cca2: 'ER', bandera: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Flag_of_Eritrea.svg', prefijo: '+291' },
  { nombre: 'Eslovaquia', nombreEn: 'Slovakia', cca2: 'SK', bandera: 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Flag_of_Slovakia.svg', prefijo: '+421' },
  { nombre: 'Eslovenia', nombreEn: 'Slovenia', cca2: 'SI', bandera: 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Flag_of_Slovenia.svg', prefijo: '+386' },
  { nombre: 'España', nombreEn: 'Spain', cca2: 'ES', bandera: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Flag_of_Spain.svg', prefijo: '+34' },
  { nombre: 'Estados Unidos', nombreEn: 'United States', cca2: 'US', bandera: 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Flag_of_the_United_States.svg', prefijo: '+1' },
  { nombre: 'Estonia', nombreEn: 'Estonia', cca2: 'EE', bandera: 'https://upload.wikimedia.org/wikipedia/commons/8/8f/Flag_of_Estonia.svg', prefijo: '+372' },
  { nombre: 'Etiopía', nombreEn: 'Ethiopia', cca2: 'ET', bandera: 'https://upload.wikimedia.org/wikipedia/commons/7/71/Flag_of_Ethiopia.svg', prefijo: '+251' },
  { nombre: 'Filipinas', nombreEn: 'Philippines', cca2: 'PH', bandera: 'https://upload.wikimedia.org/wikipedia/commons/9/99/Flag_of_the_Philippines.svg', prefijo: '+63' },
  { nombre: 'Finlandia', nombreEn: 'Finland', cca2: 'FI', bandera: 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Flag_of_Finland.svg', prefijo: '+358' },
  { nombre: 'Fiyi', nombreEn: 'Fiji', cca2: 'FJ', bandera: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Flag_of_Fiji.svg', prefijo: '+679' },
  { nombre: 'Francia', nombreEn: 'France', cca2: 'FR', bandera: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Flag_of_France.svg', prefijo: '+33' },
  { nombre: 'Gabón', nombreEn: 'Gabon', cca2: 'GA', bandera: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Flag_of_Gabon.svg', prefijo: '+241' },
  { nombre: 'Gambia', nombreEn: 'Gambia', cca2: 'GM', bandera: 'https://upload.wikimedia.org/wikipedia/commons/7/77/Flag_of_The_Gambia.svg', prefijo: '+220' },
  { nombre: 'Georgia', nombreEn: 'Georgia', cca2: 'GE', bandera: 'https://upload.wikimedia.org/wikipedia/commons/0/0f/Flag_of_Georgia.svg', prefijo: '+995' },
  { nombre: 'Ghana', nombreEn: 'Ghana', cca2: 'GH', bandera: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Flag_of_Ghana.svg', prefijo: '+233' },
  { nombre: 'Granada', nombreEn: 'Grenada', cca2: 'GD', bandera: 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Flag_of_Grenada.svg', prefijo: '+1473' },
  { nombre: 'Grecia', nombreEn: 'Greece', cca2: 'GR', bandera: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Flag_of_Greece.svg', prefijo: '+30' },
  { nombre: 'Guatemala', nombreEn: 'Guatemala', cca2: 'GT', bandera: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Flag_of_Guatemala.svg', prefijo: '+502' },
  { nombre: 'Guinea', nombreEn: 'Guinea', cca2: 'GN', bandera: 'https://upload.wikimedia.org/wikipedia/commons/e/ed/Flag_of_Guinea.svg', prefijo: '+224' },
  { nombre: 'Guinea Ecuatorial', nombreEn: 'Equatorial Guinea', cca2: 'GQ', bandera: 'https://upload.wikimedia.org/wikipedia/commons/3/31/Flag_of_Equatorial_Guinea.svg', prefijo: '+240' },
  { nombre: 'Guinea-Bisáu', nombreEn: 'Guinea-Bissau', cca2: 'GW', bandera: 'https://upload.wikimedia.org/wikipedia/commons/0/01/Flag_of_Guinea-Bissau.svg', prefijo: '+245' },
  { nombre: 'Guyana', nombreEn: 'Guyana', cca2: 'GY', bandera: 'https://upload.wikimedia.org/wikipedia/commons/9/99/Flag_of_Guyana.svg', prefijo: '+592' },
  { nombre: 'Haití', nombreEn: 'Haiti', cca2: 'HT', bandera: 'https://upload.wikimedia.org/wikipedia/commons/5/56/Flag_of_Haiti.svg', prefijo: '+509' },
  { nombre: 'Honduras', nombreEn: 'Honduras', cca2: 'HN', bandera: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Flag_of_Honduras.svg', prefijo: '+504' },
  { nombre: 'Hungría', nombreEn: 'Hungary', cca2: 'HU', bandera: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Flag_of_Hungary.svg', prefijo: '+36' },
  { nombre: 'India', nombreEn: 'India', cca2: 'IN', bandera: 'https://upload.wikimedia.org/wikipedia/commons/4/41/Flag_of_India.svg', prefijo: '+91' },
  { nombre: 'Indonesia', nombreEn: 'Indonesia', cca2: 'ID', bandera: 'https://upload.wikimedia.org/wikipedia/commons/9/9f/Flag_of_Indonesia.svg', prefijo: '+62' },
  { nombre: 'Irak', nombreEn: 'Iraq', cca2: 'IQ', bandera: 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Flag_of_Iraq.svg', prefijo: '+964' },
  { nombre: 'Irán', nombreEn: 'Iran', cca2: 'IR', bandera: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Flag_of_Iran.svg', prefijo: '+98' },
  { nombre: 'Irlanda', nombreEn: 'Ireland', cca2: 'IE', bandera: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Flag_of_Ireland.svg', prefijo: '+353' },
  { nombre: 'Islandia', nombreEn: 'Iceland', cca2: 'IS', bandera: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Flag_of_Iceland.svg', prefijo: '+354' },
  { nombre: 'Islas Marshall', nombreEn: 'Marshall Islands', cca2: 'MH', bandera: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Flag_of_the_Marshall_Islands.svg', prefijo: '+692' },
  { nombre: 'Islas Salomón', nombreEn: 'Solomon Islands', cca2: 'SB', bandera: 'https://upload.wikimedia.org/wikipedia/commons/7/74/Flag_of_the_Solomon_Islands.svg', prefijo: '+677' },
  { nombre: 'Israel', nombreEn: 'Israel', cca2: 'IL', bandera: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Flag_of_Israel.svg', prefijo: '+972' },
  { nombre: 'Italia', nombreEn: 'Italy', cca2: 'IT', bandera: 'https://upload.wikimedia.org/wikipedia/commons/0/03/Flag_of_Italy.svg', prefijo: '+39' },
  { nombre: 'Jamaica', nombreEn: 'Jamaica', cca2: 'JM', bandera: 'https://upload.wikimedia.org/wikipedia/commons/0/0a/Flag_of_Jamaica.svg', prefijo: '+1876' },
  { nombre: 'Japón', nombreEn: 'Japan', cca2: 'JP', bandera: 'https://upload.wikimedia.org/wikipedia/commons/9/9e/Flag_of_Japan.svg', prefijo: '+81' },
  { nombre: 'Jordania', nombreEn: 'Jordan', cca2: 'JO', bandera: 'https://upload.wikimedia.org/wikipedia/commons/c/c0/Flag_of_Jordan.svg', prefijo: '+962' },
  { nombre: 'Kazajistán', nombreEn: 'Kazakhstan', cca2: 'KZ', bandera: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Flag_of_Kazakhstan.svg', prefijo: '+7' },
  { nombre: 'Kenia', nombreEn: 'Kenya', cca2: 'KE', bandera: 'https://upload.wikimedia.org/wikipedia/commons/4/49/Flag_of_Kenya.svg', prefijo: '+254' },
  { nombre: 'Kirguistán', nombreEn: 'Kyrgyzstan', cca2: 'KG', bandera: 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Flag_of_Kyrgyzstan.svg', prefijo: '+996' },
  { nombre: 'Kiribati', nombreEn: 'Kiribati', cca2: 'KI', bandera: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Flag_of_Kiribati.svg', prefijo: '+686' },
  { nombre: 'Kuwait', nombreEn: 'Kuwait', cca2: 'KW', bandera: 'https://upload.wikimedia.org/wikipedia/commons/a/aa/Flag_of_Kuwait.svg', prefijo: '+965' },
  { nombre: 'Laos', nombreEn: 'Laos', cca2: 'LA', bandera: 'https://upload.wikimedia.org/wikipedia/commons/5/56/Flag_of_Laos.svg', prefijo: '+856' },
  { nombre: 'Lesoto', nombreEn: 'Lesotho', cca2: 'LS', bandera: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Flag_of_Lesotho.svg', prefijo: '+266' },
  { nombre: 'Letonia', nombreEn: 'Latvia', cca2: 'LV', bandera: 'https://upload.wikimedia.org/wikipedia/commons/8/84/Flag_of_Latvia.svg', prefijo: '+371' },
  { nombre: 'Líbano', nombreEn: 'Lebanon', cca2: 'LB', bandera: 'https://upload.wikimedia.org/wikipedia/commons/5/59/Flag_of_Lebanon.svg', prefijo: '+961' },
  { nombre: 'Liberia', nombreEn: 'Liberia', cca2: 'LR', bandera: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Flag_of_Liberia.svg', prefijo: '+231' },
  { nombre: 'Libia', nombreEn: 'Libya', cca2: 'LY', bandera: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Flag_of_Libya.svg', prefijo: '+218' },
  { nombre: 'Liechtenstein', nombreEn: 'Liechtenstein', cca2: 'LI', bandera: 'https://upload.wikimedia.org/wikipedia/commons/4/47/Flag_of_Liechtenstein.svg', prefijo: '+423' },
  { nombre: 'Lituania', nombreEn: 'Lithuania', cca2: 'LT', bandera: 'https://upload.wikimedia.org/wikipedia/commons/1/11/Flag_of_Lithuania.svg', prefijo: '+370' },
  { nombre: 'Luxemburgo', nombreEn: 'Luxembourg', cca2: 'LU', bandera: 'https://upload.wikimedia.org/wikipedia/commons/d/da/Flag_of_Luxembourg.svg', prefijo: '+352' },
  { nombre: 'Madagascar', nombreEn: 'Madagascar', cca2: 'MG', bandera: 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Flag_of_Madagascar.svg', prefijo: '+261' },
  { nombre: 'Malasia', nombreEn: 'Malaysia', cca2: 'MY', bandera: 'https://upload.wikimedia.org/wikipedia/commons/6/66/Flag_of_Malaysia.svg', prefijo: '+60' },
  { nombre: 'Malaui', nombreEn: 'Malawi', cca2: 'MW', bandera: 'https://upload.wikimedia.org/wikipedia/commons/d/d1/Flag_of_Malawi.svg', prefijo: '+265' },
  { nombre: 'Maldivas', nombreEn: 'Maldives', cca2: 'MV', bandera: 'https://upload.wikimedia.org/wikipedia/commons/0/0f/Flag_of_Maldives.svg', prefijo: '+960' },
  { nombre: 'Malí', nombreEn: 'Mali', cca2: 'ML', bandera: 'https://upload.wikimedia.org/wikipedia/commons/9/92/Flag_of_Mali.svg', prefijo: '+223' },
  { nombre: 'Malta', nombreEn: 'Malta', cca2: 'MT', bandera: 'https://upload.wikimedia.org/wikipedia/commons/7/73/Flag_of_Malta.svg', prefijo: '+356' },
  { nombre: 'Marruecos', nombreEn: 'Morocco', cca2: 'MA', bandera: 'https://upload.wikimedia.org/wikipedia/commons/2/2c/Flag_of_Morocco.svg', prefijo: '+212' },
  { nombre: 'Mauricio', nombreEn: 'Mauritius', cca2: 'MU', bandera: 'https://upload.wikimedia.org/wikipedia/commons/7/77/Flag_of_Mauritius.svg', prefijo: '+230' },
  { nombre: 'Mauritania', nombreEn: 'Mauritania', cca2: 'MR', bandera: 'https://upload.wikimedia.org/wikipedia/commons/4/43/Flag_of_Mauritania.svg', prefijo: '+222' },
  { nombre: 'México', nombreEn: 'Mexico', cca2: 'MX', bandera: 'https://upload.wikimedia.org/wikipedia/commons/f/fc/Flag_of_Mexico.svg', prefijo: '+52' },
  { nombre: 'Micronesia', nombreEn: 'Micronesia', cca2: 'FM', bandera: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Flag_of_the_Federated_States_of_Micronesia.svg', prefijo: '+691' },
  { nombre: 'Moldavia', nombreEn: 'Moldova', cca2: 'MD', bandera: 'https://upload.wikimedia.org/wikipedia/commons/2/27/Flag_of_Moldova.svg', prefijo: '+373' },
  { nombre: 'Mónaco', nombreEn: 'Monaco', cca2: 'MC', bandera: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Flag_of_Monaco.svg', prefijo: '+377' },
  { nombre: 'Mongolia', nombreEn: 'Mongolia', cca2: 'MN', bandera: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Flag_of_Mongolia.svg', prefijo: '+976' },
  { nombre: 'Montenegro', nombreEn: 'Montenegro', cca2: 'ME', bandera: 'https://upload.wikimedia.org/wikipedia/commons/6/64/Flag_of_Montenegro.svg', prefijo: '+382' },
  { nombre: 'Mozambique', nombreEn: 'Mozambique', cca2: 'MZ', bandera: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Flag_of_Mozambique.svg', prefijo: '+258' },
  { nombre: 'Myanmar', nombreEn: 'Myanmar', cca2: 'MM', bandera: 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Flag_of_Myanmar.svg', prefijo: '+95' },
  { nombre: 'Namibia', nombreEn: 'Namibia', cca2: 'NA', bandera: 'https://upload.wikimedia.org/wikipedia/commons/0/00/Flag_of_Namibia.svg', prefijo: '+264' },
  { nombre: 'Nauru', nombreEn: 'Nauru', cca2: 'NR', bandera: 'https://upload.wikimedia.org/wikipedia/commons/3/30/Flag_of_Nauru.svg', prefijo: '+674' },
  { nombre: 'Nepal', nombreEn: 'Nepal', cca2: 'NP', bandera: 'https://upload.wikimedia.org/wikipedia/commons/9/9b/Flag_of_Nepal.svg', prefijo: '+977' },
  { nombre: 'Nicaragua', nombreEn: 'Nicaragua', cca2: 'NI', bandera: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Flag_of_Nicaragua.svg', prefijo: '+505' },
  { nombre: 'Níger', nombreEn: 'Niger', cca2: 'NE', bandera: 'https://upload.wikimedia.org/wikipedia/commons/f/f4/Flag_of_Niger.svg', prefijo: '+227' },
  { nombre: 'Nigeria', nombreEn: 'Nigeria', cca2: 'NG', bandera: 'https://upload.wikimedia.org/wikipedia/commons/7/79/Flag_of_Nigeria.svg', prefijo: '+234' },
  { nombre: 'Noruega', nombreEn: 'Norway', cca2: 'NO', bandera: 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Flag_of_Norway.svg', prefijo: '+47' },
  { nombre: 'Nueva Zelanda', nombreEn: 'New Zealand', cca2: 'NZ', bandera: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Flag_of_New_Zealand.svg', prefijo: '+64' },
  { nombre: 'Omán', nombreEn: 'Oman', cca2: 'OM', bandera: 'https://upload.wikimedia.org/wikipedia/commons/d/dd/Flag_of_Oman.svg', prefijo: '+968' },
  { nombre: 'Países Bajos', nombreEn: 'Netherlands', cca2: 'NL', bandera: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Flag_of_the_Netherlands.svg', prefijo: '+31' },
  { nombre: 'Pakistán', nombreEn: 'Pakistan', cca2: 'PK', bandera: 'https://upload.wikimedia.org/wikipedia/commons/3/32/Flag_of_Pakistan.svg', prefijo: '+92' },
  { nombre: 'Palaos', nombreEn: 'Palau', cca2: 'PW', bandera: 'https://upload.wikimedia.org/wikipedia/commons/4/48/Flag_of_Palau.svg', prefijo: '+680' },
  { nombre: 'Panamá', nombreEn: 'Panama', cca2: 'PA', bandera: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Flag_of_Panama.svg', prefijo: '+507' },
  { nombre: 'Papúa Nueva Guinea', nombreEn: 'Papua New Guinea', cca2: 'PG', bandera: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Flag_of_Papua_New_Guinea.svg', prefijo: '+675' },
  { nombre: 'Paraguay', nombreEn: 'Paraguay', cca2: 'PY', bandera: 'https://upload.wikimedia.org/wikipedia/commons/2/27/Flag_of_Paraguay.svg', prefijo: '+595' },
  { nombre: 'Perú', nombreEn: 'Peru', cca2: 'PE', bandera: 'https://upload.wikimedia.org/wikipedia/commons/c/cf/Flag_of_Peru.svg', prefijo: '+51' },
  { nombre: 'Polonia', nombreEn: 'Poland', cca2: 'PL', bandera: 'https://upload.wikimedia.org/wikipedia/commons/1/12/Flag_of_Poland.svg', prefijo: '+48' },
  { nombre: 'Portugal', nombreEn: 'Portugal', cca2: 'PT', bandera: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Flag_of_Portugal.svg', prefijo: '+351' },
  { nombre: 'Qatar', nombreEn: 'Qatar', cca2: 'QA', bandera: 'https://upload.wikimedia.org/wikipedia/commons/6/65/Flag_of_Qatar.svg', prefijo: '+974' },
  { nombre: 'Reino Unido', nombreEn: 'United Kingdom', cca2: 'GB', bandera: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Flag_of_the_United_Kingdom.svg', prefijo: '+44' },
  { nombre: 'República Centroafricana', nombreEn: 'Central African Republic', cca2: 'CF', bandera: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Flag_of_the_Central_African_Republic.svg', prefijo: '+236' },
  { nombre: 'República Checa', nombreEn: 'Czech Republic', cca2: 'CZ', bandera: 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Flag_of_the_Czech_Republic.svg', prefijo: '+420' },
  { nombre: 'República Democrática del Congo', nombreEn: 'Democratic Republic of the Congo', cca2: 'CD', bandera: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Flag_of_the_Democratic_Republic_of_the_Congo.svg', prefijo: '+243' },
  { nombre: 'República Dominicana', nombreEn: 'Dominican Republic', cca2: 'DO', bandera: 'https://upload.wikimedia.org/wikipedia/commons/9/9f/Flag_of_the_Dominican_Republic.svg', prefijo: '+1809' },
  { nombre: 'Ruanda', nombreEn: 'Rwanda', cca2: 'RW', bandera: 'https://upload.wikimedia.org/wikipedia/commons/1/17/Flag_of_Rwanda.svg', prefijo: '+250' },
  { nombre: 'Rumania', nombreEn: 'Romania', cca2: 'RO', bandera: 'https://upload.wikimedia.org/wikipedia/commons/7/73/Flag_of_Romania.svg', prefijo: '+40' },
  { nombre: 'Rusia', nombreEn: 'Russia', cca2: 'RU', bandera: 'https://upload.wikimedia.org/wikipedia/commons/f/f3/Flag_of_Russia.svg', prefijo: '+7' },
  { nombre: 'Samoa', nombreEn: 'Samoa', cca2: 'WS', bandera: 'https://upload.wikimedia.org/wikipedia/commons/3/31/Flag_of_Samoa.svg', prefijo: '+685' },
  { nombre: 'San Cristóbal y Nieves', nombreEn: 'Saint Kitts and Nevis', cca2: 'KN', bandera: 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Flag_of_Saint_Kitts_and_Nevis.svg', prefijo: '+1869' },
  { nombre: 'San Marino', nombreEn: 'San Marino', cca2: 'SM', bandera: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Flag_of_San_Marino.svg', prefijo: '+378' },
  { nombre: 'San Vicente y las Granadinas', nombreEn: 'Saint Vincent and the Grenadines', cca2: 'VC', bandera: 'https://upload.wikimedia.org/wikipedia/commons/6/6d/Flag_of_Saint_Vincent_and_the_Grenadines.svg', prefijo: '+1784' },
  { nombre: 'Santa Lucía', nombreEn: 'Saint Lucia', cca2: 'LC', bandera: 'https://upload.wikimedia.org/wikipedia/commons/9/9f/Flag_of_Saint_Lucia.svg', prefijo: '+1758' },
  { nombre: 'Santo Tomé y Príncipe', nombreEn: 'Sao Tome and Principe', cca2: 'ST', bandera: 'https://upload.wikimedia.org/wikipedia/commons/0/0a/Flag_of_Sao_Tome_and_Principe.svg', prefijo: '+239' },
  { nombre: 'Senegal', nombreEn: 'Senegal', cca2: 'SN', bandera: 'https://upload.wikimedia.org/wikipedia/commons/f/fd/Flag_of_Senegal.svg', prefijo: '+221' },
  { nombre: 'Serbia', nombreEn: 'Serbia', cca2: 'RS', bandera: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Flag_of_Serbia.svg', prefijo: '+381' },
  { nombre: 'Seychelles', nombreEn: 'Seychelles', cca2: 'SC', bandera: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Flag_of_Seychelles.svg', prefijo: '+248' },
  { nombre: 'Sierra Leona', nombreEn: 'Sierra Leone', cca2: 'SL', bandera: 'https://upload.wikimedia.org/wikipedia/commons/1/17/Flag_of_Sierra_Leone.svg', prefijo: '+232' },
  { nombre: 'Singapur', nombreEn: 'Singapore', cca2: 'SG', bandera: 'https://upload.wikimedia.org/wikipedia/commons/4/48/Flag_of_Singapore.svg', prefijo: '+65' },
  { nombre: 'Siria', nombreEn: 'Syria', cca2: 'SY', bandera: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Flag_of_Syria.svg', prefijo: '+963' },
  { nombre: 'Somalia', nombreEn: 'Somalia', cca2: 'SO', bandera: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Flag_of_Somalia.svg', prefijo: '+252' },
  { nombre: 'Sri Lanka', nombreEn: 'Sri Lanka', cca2: 'LK', bandera: 'https://upload.wikimedia.org/wikipedia/commons/1/11/Flag_of_Sri_Lanka.svg', prefijo: '+94' },
  { nombre: 'Suazilandia', nombreEn: 'Eswatini', cca2: 'SZ', bandera: 'https://upload.wikimedia.org/wikipedia/commons/1/1e/Flag_of_Eswatini.svg', prefijo: '+268' },
  { nombre: 'Sudáfrica', nombreEn: 'South Africa', cca2: 'ZA', bandera: 'https://upload.wikimedia.org/wikipedia/commons/a/af/Flag_of_South_Africa.svg', prefijo: '+27' },
  { nombre: 'Sudán', nombreEn: 'Sudan', cca2: 'SD', bandera: 'https://upload.wikimedia.org/wikipedia/commons/0/01/Flag_of_Sudan.svg', prefijo: '+249' },
  { nombre: 'Sudán del Sur', nombreEn: 'South Sudan', cca2: 'SS', bandera: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Flag_of_South_Sudan.svg', prefijo: '+211' },
  { nombre: 'Suecia', nombreEn: 'Sweden', cca2: 'SE', bandera: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Flag_of_Sweden.svg', prefijo: '+46' },
  { nombre: 'Suiza', nombreEn: 'Switzerland', cca2: 'CH', bandera: 'https://upload.wikimedia.org/wikipedia/commons/f/f3/Flag_of_Switzerland.svg', prefijo: '+41' },
  { nombre: 'Surinam', nombreEn: 'Suriname', cca2: 'SR', bandera: 'https://upload.wikimedia.org/wikipedia/commons/6/60/Flag_of_Suriname.svg', prefijo: '+597' },
  { nombre: 'Tailandia', nombreEn: 'Thailand', cca2: 'TH', bandera: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Flag_of_Thailand.svg', prefijo: '+66' },
  { nombre: 'Taiwán', nombreEn: 'Taiwan', cca2: 'TW', bandera: 'https://upload.wikimedia.org/wikipedia/commons/7/72/Flag_of_the_Republic_of_China.svg', prefijo: '+886' },
  { nombre: 'Tanzania', nombreEn: 'Tanzania', cca2: 'TZ', bandera: 'https://upload.wikimedia.org/wikipedia/commons/3/38/Flag_of_Tanzania.svg', prefijo: '+255' },
  { nombre: 'Tayikistán', nombreEn: 'Tajikistan', cca2: 'TJ', bandera: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Flag_of_Tajikistan.svg', prefijo: '+992' },
  { nombre: 'Timor Oriental', nombreEn: 'East Timor', cca2: 'TL', bandera: 'https://upload.wikimedia.org/wikipedia/commons/2/26/Flag_of_East_Timor.svg', prefijo: '+670' },
  { nombre: 'Togo', nombreEn: 'Togo', cca2: 'TG', bandera: 'https://upload.wikimedia.org/wikipedia/commons/6/68/Flag_of_Togo.svg', prefijo: '+228' },
  { nombre: 'Tonga', nombreEn: 'Tonga', cca2: 'TO', bandera: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Flag_of_Tonga.svg', prefijo: '+676' },
  { nombre: 'Trinidad y Tobago', nombreEn: 'Trinidad and Tobago', cca2: 'TT', bandera: 'https://upload.wikimedia.org/wikipedia/commons/6/64/Flag_of_Trinidad_and_Tobago.svg', prefijo: '+1868' },
  { nombre: 'Túnez', nombreEn: 'Tunisia', cca2: 'TN', bandera: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Flag_of_Tunisia.svg', prefijo: '+216' },
  { nombre: 'Turkmenistán', nombreEn: 'Turkmenistan', cca2: 'TM', bandera: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/Flag_of_Turkmenistan.svg', prefijo: '+993' },
  { nombre: 'Turquía', nombreEn: 'Turkey', cca2: 'TR', bandera: 'https://upload.wikimedia.org/wikipedia/commons/b/b4/Flag_of_Turkey.svg', prefijo: '+90' },
  { nombre: 'Tuvalu', nombreEn: 'Tuvalu', cca2: 'TV', bandera: 'https://upload.wikimedia.org/wikipedia/commons/3/38/Flag_of_Tuvalu.svg', prefijo: '+688' },
  { nombre: 'Ucrania', nombreEn: 'Ukraine', cca2: 'UA', bandera: 'https://upload.wikimedia.org/wikipedia/commons/4/49/Flag_of_Ukraine.svg', prefijo: '+380' },
  { nombre: 'Uganda', nombreEn: 'Uganda', cca2: 'UG', bandera: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Flag_of_Uganda.svg', prefijo: '+256' },
  { nombre: 'Uruguay', nombreEn: 'Uruguay', cca2: 'UY', bandera: 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Flag_of_Uruguay.svg', prefijo: '+598' },
  { nombre: 'Uzbekistán', nombreEn: 'Uzbekistan', cca2: 'UZ', bandera: 'https://upload.wikimedia.org/wikipedia/commons/8/84/Flag_of_Uzbekistan.svg', prefijo: '+998' },
  { nombre: 'Vanuatu', nombreEn: 'Vanuatu', cca2: 'VU', bandera: 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Flag_of_Vanuatu.svg', prefijo: '+678' },
  { nombre: 'Vaticano', nombreEn: 'Vatican City', cca2: 'VA', bandera: 'https://upload.wikimedia.org/wikipedia/commons/0/00/Flag_of_the_Vatican_City.svg', prefijo: '+379' },
  { nombre: 'Venezuela', nombreEn: 'Venezuela', cca2: 'VE', bandera: 'https://upload.wikimedia.org/wikipedia/commons/0/06/Flag_of_Venezuela.svg', prefijo: '+58' },
  { nombre: 'Vietnam', nombreEn: 'Vietnam', cca2: 'VN', bandera: 'https://upload.wikimedia.org/wikipedia/commons/2/21/Flag_of_Vietnam.svg', prefijo: '+84' },
  { nombre: 'Yemen', nombreEn: 'Yemen', cca2: 'YE', bandera: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Flag_of_Yemen.svg', prefijo: '+967' },
  { nombre: 'Yibuti', nombreEn: 'Djibouti', cca2: 'DJ', bandera: 'https://upload.wikimedia.org/wikipedia/commons/3/34/Flag_of_Djibouti.svg', prefijo: '+253' },
  { nombre: 'Zambia', nombreEn: 'Zambia', cca2: 'ZM', bandera: 'https://upload.wikimedia.org/wikipedia/commons/0/06/Flag_of_Zambia.svg', prefijo: '+260' },
  { nombre: 'Zimbabue', nombreEn: 'Zimbabwe', cca2: 'ZW', bandera: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Flag_of_Zimbabwe.svg', prefijo: '+263' },
];

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
      .post<any>(PROXY_URL, { country: pais }, {
        params: { url: 'https://countriesnow.space/api/v0.1/countries/states' },
      })
      .pipe(
        map((res) => res?.data?.states?.map((s: any) => s.name) || []),
        catchError(() => of([])),
        shareReplay(1),
      );
    this.estadosCache.set(pais, request);
    return request;
  }

  detectarPaisPorPrefijo(phone: string): Observable<{ nombre: string; bandera: string; codigo: string; cca2: string } | null> {
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
