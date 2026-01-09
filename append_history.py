import json
import os

# Batch 2 Data (95-190)
new_data = [
    {"id": 95, "event": "Révolte des Canuts", "date": "1831", "city": "Lyon", "description": "Première grande insurrection sociale ouvrière de l'ère industrielle par les tisserands de soie.", "lat": 45.764, "lng": 4.8357},
    {"id": 96, "event": "Arsenal de Rochefort", "date": "XVIIe siècle", "city": "Rochefort", "description": "Ville nouvelle créée par Colbert pour devenir un arsenal maritime et construire la flotte du Roi-Soleil.", "lat": 45.9421, "lng": -0.9588},
    {"id": 97, "event": "Palais des Papes (Rappel)", "date": "XIVe siècle", "city": "Avignon", "description": "Plus grande construction gothique du Moyen Âge, siège de la papauté en France.", "lat": 43.9493, "lng": 4.8055},
    {"id": 98, "event": "Sac de Béziers (Rappel)", "date": "1209", "city": "Béziers", "description": "Ville marquée par le massacre de sa population par les croisés ('Tuez-les tous, Dieu reconnaîtra les siens').", "lat": 43.3412, "lng": 3.2140},
    {"id": 99, "event": "Port Militaire", "date": "XIXe siècle", "city": "Cherbourg-en-Cotentin", "description": "Ville dotée de la plus grande rade artificielle du monde, immense ouvrage militaire.", "lat": 49.6390, "lng": -1.6250},
    {"id": 100, "event": "Traité des Pyrénées (Rappel)", "date": "1659", "city": "Saint-Jean-de-Luz", "description": "Ville témoin du mariage de Louis XIV avec l'infante Marie-Thérèse d'Espagne.", "lat": 43.39, "lng": -1.66},
    {"id": 101, "event": "Imprimerie Royale", "date": "1538", "city": "Paris", "description": "Ville où François Ier nomma le premier imprimeur du roi, ancêtre de l'Imprimerie nationale.", "lat": 48.8566, "lng": 2.3522},
    {"id": 102, "event": "Port de la Lune", "date": "XVIIIe siècle", "city": "Bordeaux", "description": "Ville dont le port classé à l'UNESCO fut le cœur du commerce atlantique et du vin.", "lat": 44.8378, "lng": -0.5792},
    {"id": 103, "event": "Université de Droit", "date": "1306", "city": "Orléans", "description": "Ville universitaire réputée où étudièrent Molière et Calvin, spécialisée en droit romain.", "lat": 47.9029, "lng": 1.9092},
    {"id": 104, "event": "Concile d'Auxerre", "date": "IXe siècle", "city": "Auxerre", "description": "Ville hôte d'un synode important pour l'église locale en Bourgogne.", "lat": 47.7986, "lng": 3.5672},
    {"id": 105, "event": "Reine des Citadelles", "date": "XVIIe siècle", "city": "Lille", "description": "Ville fortifiée par Vauban avec une citadelle en étoile considérée comme son chef-d'œuvre.", "lat": 50.6292, "lng": 3.0573},
    {"id": 106, "event": "Résistance Protestante", "date": "1621", "city": "Montauban", "description": "Ville qui résista victorieusement au siège de Louis XIII lors des rébellions huguenotes.", "lat": 44.0181, "lng": 1.3558},
    {"id": 107, "event": "Première Cathédrale Gothique", "date": "XIIe siècle", "city": "Sens", "description": "Ville abritant la cathédrale Saint-Étienne, considérée comme la première du style gothique.", "lat": 48.2000, "lng": 3.2833},
    {"id": 108, "event": "Corderie Royale", "date": "1666", "city": "Rochefort", "description": "Ville abritant la célèbre manufacture de cordages pour la marine royale, la plus longue d'Europe.", "lat": 45.9421, "lng": -0.9588},
    {"id": 109, "event": "Désastre de Sedan", "date": "1870", "city": "Sedan", "description": "Lieu de la capitulation de Napoléon III face aux Prussiens, entraînant la chute du Second Empire.", "lat": 49.7000, "lng": 4.9500},
    {"id": 110, "event": "Amphithéâtre Romain", "date": "Ier siècle", "city": "Nîmes", "description": "Ville possédant des arènes romaines parmi les mieux conservées au monde.", "lat": 43.8367, "lng": 4.3601},
    {"id": 111, "event": "Bassin Minier", "date": "XIXe siècle", "city": "Lens", "description": "Ville au cœur de l'exploitation charbonnière du Nord-Pas-de-Calais.", "lat": 50.4322, "lng": 2.8333},
    {"id": 112, "event": "Proclamation de la République", "date": "1848", "city": "Paris", "description": "Ville où Lamartine proclama la IIe République à l'Hôtel de Ville.", "lat": 48.8566, "lng": 2.3522},
    {"id": 113, "event": "Cité de Carcassonne (Rappel)", "date": "Moyen Âge", "city": "Carcassonne", "description": "Ville fortifiée doublement remparée, modèle d'architecture militaire médiévale.", "lat": 43.2121, "lng": 2.3529},
    {"id": 114, "event": "Siège d'Arras", "date": "1640", "city": "Arras", "description": "Ville reprise aux Espagnols par les troupes de Louis XIII après un siège difficile.", "lat": 50.292, "lng": 2.780},
    {"id": 115, "event": "Foires de Champagne (Rappel)", "date": "Moyen Âge", "city": "Troyes", "description": "Ville dont la structure urbaine en forme de 'bouchon de champagne' rappelle son passé commerçant.", "lat": 48.3000, "lng": 4.0833},
    {"id": 116, "event": "Royaume d'Arles", "date": "Xe siècle", "city": "Arles", "description": "Ancienne capitale d'un royaume couvrant la Provence et la Bourgogne jurane.", "lat": 43.6767, "lng": 4.6278},
    {"id": 117, "event": "Manufacture des Rames", "date": "1665", "city": "Abbeville", "description": "Ville où Colbert fonda une manufacture royale de draps fins (Van Robais).", "lat": 50.1055, "lng": 1.8368},
    {"id": 118, "event": "Débarquement de Provence", "date": "Août 1944", "city": "Saint-Raphaël", "description": "Ville située dans la zone du débarquement allié (Opération Dragoon) sur la côte méditerranéenne.", "lat": 43.4252, "lng": 6.7684},
    {"id": 119, "event": "Révolte des Canuts (Rappel)", "date": "1831", "city": "Lyon", "description": "Ville théâtre des violentes émeutes des ouvriers de la soie réclamant un tarif minimum.", "lat": 45.764, "lng": 4.8357},
    {"id": 120, "event": "Adieux de Fontainebleau", "date": "1814", "city": "Fontainebleau", "description": "Lieu de la célèbre scène des adieux de Napoléon à sa Garde dans la cour du Cheval Blanc.", "lat": 48.4047, "lng": 2.7016},
    {"id": 121, "event": "Commerce Triangulaire", "date": "XVIIIe siècle", "city": "La Rochelle", "description": "Ville portuaire majeure du commerce atlantique et de la traite négrière.", "lat": 46.1603, "lng": -1.1511},
    {"id": 122, "event": "Place Forte de l'Est", "date": "XIXe siècle", "city": "Metz", "description": "Ville fortifiée devenue allemande en 1871 puis redevenue française en 1918.", "lat": 49.1193, "lng": 6.1757},
    {"id": 123, "event": "Sorbonne", "date": "1253", "city": "Paris", "description": "Ville abritant le célèbre collège fondé par Robert de Sorbon pour les étudiants en théologie.", "lat": 48.8566, "lng": 2.3522},
    {"id": 124, "event": "Bataille de Nancy (Rappel)", "date": "1477", "city": "Nancy", "description": "Victoire décisive du duc de Lorraine René II contre Charles le Téméraire.", "lat": 48.6921, "lng": 6.1844},
    {"id": 125, "event": "Port du Levant", "date": "XVIIe siècle", "city": "Toulon", "description": "Base navale stratégique développée par Richelieu et Louis XIV face à l'Espagne et l'Italie.", "lat": 43.1242, "lng": 5.9280},
    {"id": 126, "event": "Bleu de Chartres", "date": "Moyen Âge", "city": "Chartres", "description": "Ville célèbre pour le bleu unique des vitraux de sa cathédrale Notre-Dame.", "lat": 48.4469, "lng": 1.4893},
    {"id": 127, "event": "Capitale de la Soie", "date": "XIXe siècle", "city": "Lyon", "description": "Ville dominant le marché mondial de la soie grâce au métier Jacquard.", "lat": 45.764, "lng": 4.8357},
    {"id": 128, "event": "Paix des Pyrénées", "date": "1659", "city": "Saint-Jean-de-Luz", "description": "Ville frontalière scellant la paix entre la France et l'Espagne.", "lat": 43.39, "lng": -1.66},
    {"id": 129, "event": "Bataille de Poitiers", "date": "1356", "city": "Poitiers", "description": "Défaite française où le roi Jean II le Bon fut capturé par les Anglais (Prince Noir).", "lat": 46.5826, "lng": 0.3435},
    {"id": 130, "event": "Abbaye de Cluny", "date": "910", "city": "Cluny", "description": "Siège du plus grand ordre monastique médiéval d'Occident, rayonnant sur toute l'Europe.", "lat": 46.4332, "lng": 4.6585},
    {"id": 131, "event": "École Militaire", "date": "1750", "city": "Paris", "description": "Institution fondée par Louis XV et la Pompadour pour former les officiers (dont Napoléon).", "lat": 48.8566, "lng": 2.3522},
    {"id": 132, "event": "Corsaire Jean Bart", "date": "XVIIe siècle", "city": "Dunkerque", "description": "Ville portuaire imprenable, patrie du célèbre corsaire Jean Bart.", "lat": 51.0330, "lng": 2.3770},
    {"id": 133, "event": "Procès de Louis XVI", "date": "1792-1793", "city": "Paris", "description": "Ville où le roi fut jugé par la Convention nationale.", "lat": 48.8566, "lng": 2.3522},
    {"id": 134, "event": "Faïence de Nevers", "date": "XVIe siècle", "city": "Nevers", "description": "Ville réputée pour sa production de faïence de grand feu, introduite par des artistes italiens.", "lat": 46.9896, "lng": 3.1590},
    {"id": 135, "event": "Aliénor d'Aquitaine", "date": "XIIe siècle", "city": "Poitiers", "description": "Ville résidence de la duchesse d'Aquitaine et reine, qui y tint une cour brillante.", "lat": 46.5826, "lng": 0.3435},
    {"id": 136, "event": "Siège de Lyon", "date": "1793", "city": "Lyon", "description": "Ville assiégée et bombardée par les armées révolutionnaires pour s'être rebellée contre la Convention.", "lat": 45.764, "lng": 4.8357},
    {"id": 137, "event": "Rencontre de Chinon", "date": "1429", "city": "Chinon", "description": "Forteresse où Jeanne d'Arc reconnut le futur Charles VII et le convainquit de sa mission.", "lat": 47.1667, "lng": 0.2500},
    {"id": 138, "event": "Capitale Impériale (Trèves)", "date": "IVe siècle", "city": "Trèves", "description": "Ancienne capitale de l'Empire romain d'Occident (aujourd'hui en Allemagne, mais historiquement liée à la Gaule).", "lat": 49.7557, "lng": 6.6394},
    {"id": 139, "event": "Cité Épiscopale", "date": "XIIIe siècle", "city": "Albi", "description": "Ville de brique rouge, siège de la lutte contre l'hérésie cathare (Cathédrale Sainte-Cécile).", "lat": 43.9298, "lng": 2.1480},
    {"id": 140, "event": "Traité de Paris", "date": "1814/1815", "city": "Paris", "description": "Lieu de signature des traités rétablissant la paix en Europe après les guerres napoléoniennes.", "lat": 48.8566, "lng": 2.3522},
    {"id": 141, "event": "Arles Romaine", "date": "Antiquité", "city": "Arles", "description": "Surnommée la 'petite Rome des Gaules', carrefour fluvial et maritime majeur.", "lat": 43.6767, "lng": 4.6278},
    {"id": 142, "event": "Manufacture d'Armes", "date": "XIXe siècle", "city": "Tulle", "description": "Ville célèbre pour sa manufacture royale d'armes à feu (MAT).", "lat": 45.2678, "lng": 1.7706},
    {"id": 143, "event": "Aéropostale", "date": "XXe siècle", "city": "Toulouse", "description": "Ville pionnière de l'aviation civile et point de départ des lignes vers l'Amérique du Sud.", "lat": 43.6047, "lng": 1.4442},
    {"id": 144, "event": "Montagne Couronnée", "date": "XIIe siècle", "city": "Laon", "description": "Ville perchée célèbre pour sa cathédrale aux tours ornées de bœufs de pierre.", "lat": 49.5639, "lng": 3.6244},
    {"id": 145, "event": "Capitale de Normandie", "date": "Xe siècle", "city": "Rouen", "description": "Ville résidence des ducs de Normandie, dont Rollon.", "lat": 49.4432, "lng": 1.0999},
    {"id": 146, "event": "Inquisition", "date": "XIIIe siècle", "city": "Toulouse", "description": "Ville où fut établi le premier tribunal de l'Inquisition pour lutter contre les cathares.", "lat": 43.6047, "lng": 1.4442},
    {"id": 147, "event": "Assassinat du Duc de Guise", "date": "1588", "city": "Blois", "description": "Château royal où Henri III fit assassiner son rival, le duc de Guise.", "lat": 47.5939, "lng": 1.3281},
    {"id": 148, "event": "Bourse de Paris", "date": "1724", "city": "Paris", "description": "Ville où fut officiellement créée la Bourse de commerce.", "lat": 48.8566, "lng": 2.3522},
    {"id": 149, "event": "Port du Vin", "date": "Moyen Âge", "city": "Bordeaux", "description": "Ville dont la prospérité fut liée au commerce du vin vers l'Angleterre.", "lat": 44.8378, "lng": -0.5792},
    {"id": 150, "event": "Bataille de Cholet", "date": "1793", "city": "Cholet", "description": "Affrontement décisif des guerres de Vendée.", "lat": 47.0594, "lng": -0.8798},
    {"id": 151, "event": "Grand Argentier", "date": "XVe siècle", "city": "Bourges", "description": "Ville natale de Jacques Cœur, riche marchand et argentier de Charles VII.", "lat": 47.0844, "lng": 2.3964},
    {"id": 152, "event": "Cathédrale de Rouen", "date": "Gothique", "city": "Rouen", "description": "Ville dont la cathédrale possède la plus haute flèche de France (151m), peinte par Monet.", "lat": 49.4432, "lng": 1.0999},
    {"id": 153, "event": "Rade de Cherbourg", "date": "XIXe siècle", "city": "Cherbourg-en-Cotentin", "description": "Port doté d'une immense digue construite en mer, visitée par Napoléon III.", "lat": 49.6390, "lng": -1.6250},
    {"id": 154, "event": "Augustodunum", "date": "Antiquité", "city": "Autun", "description": "Ville fondée par l'empereur Auguste pour être une 'sœur de Rome' en Gaule.", "lat": 46.9517, "lng": 4.2994},
    {"id": 155, "event": "Insurrection Fédéraliste", "date": "1793", "city": "Marseille", "description": "Ville qui se souleva contre la Convention montagnarde, entraînant une répression sévère.", "lat": 43.2965, "lng": 5.3698},
    {"id": 156, "event": "Cité Vauban", "date": "XVIIe siècle", "city": "Briançon", "description": "Plus haute ville fortifiée d'Europe, verrouillant les cols alpins.", "lat": 44.8964, "lng": 6.6356},
    {"id": 157, "event": "Départ de Saint-Jacques", "date": "Moyen Âge", "city": "Le Puy-en-Velay", "description": "Point de départ de la Via Podiensis, l'un des principaux chemins de Compostelle.", "lat": 45.0437, "lng": 3.8852},
    {"id": 158, "event": "Saint-Nazaire Atlantique", "date": "XIXe siècle", "city": "Saint-Nazaire", "description": "Port transatlantique développé pour relier la France aux Amériques (paquebots).", "lat": 47.2833, "lng": -2.2000},
    {"id": 159, "event": "Tapisserie d'Aubusson", "date": "XVIe siècle", "city": "Aubusson", "description": "Capitale mondiale de la tapisserie, classée au patrimoine immatériel de l'UNESCO.", "lat": 45.957, "lng": 2.1683},
    {"id": 160, "event": "Capitale de la Préhistoire", "date": "Paléolithique", "city": "Les Eyzies-de-Tayac", "description": "Lieu de découverte de l'homme de Cro-Magnon et centre de la vallée de la Vézère.", "lat": 44.9300, "lng": 1.0299},
    {"id": 161, "event": "Congrès de Tours", "date": "1920", "city": "Tours", "description": "Lieu de la scission de la SFIO qui donna naissance au Parti communiste français.", "lat": 47.3941, "lng": 0.6848},
    {"id": 162, "event": "Métropole horlogère", "date": "XIXe siècle", "city": "Besançon", "description": "Capitale française de l'horlogerie d'art et de précision.", "lat": 47.2488, "lng": 6.0182},
    {"id": 163, "event": "Usines Peugeot", "date": "1912", "city": "Sochaux", "description": "Berceau historique et immense site industriel de la marque automobile Peugeot.", "lat": 47.5140, "lng": 6.8310},
    {"id": 164, "event": "Capitale de la Résistance", "date": "1940-1944", "city": "Lyon", "description": "Ville centre des mouvements de Résistance (Jean Moulin) grâce à ses traboules.", "lat": 45.764, "lng": 4.8357},
    {"id": 165, "event": "Alignements de Carnac", "date": "Néolithique", "city": "Carnac", "description": "Site mondialement connu pour ses milliers de menhirs alignés.", "lat": 47.5835, "lng": -3.0788},
    {"id": 166, "event": "Chantiers de l'Atlantique", "date": "XXe siècle", "city": "Saint-Nazaire", "description": "Lieu de construction des plus grands paquebots du monde (Normandie, Queen Mary 2).", "lat": 47.2833, "lng": -2.2000},
    {"id": 167, "event": "Capitale des Flandres", "date": "Moyen Âge", "city": "Lille", "description": "Ville marchande prospère disputée entre France, Bourgogne et Espagne.", "lat": 50.6292, "lng": 3.0573},
    {"id": 168, "event": "Paix d'Alès", "date": "1629", "city": "Alès", "description": "Lieu de la signature de la 'Paix de Grâce' par Louis XIII, fin des guerres de religion.", "lat": 44.1260, "lng": 4.0765},
    {"id": 169, "event": "Régime de Vichy", "date": "1940-1944", "city": "Vichy", "description": "Siège du gouvernement de l'État français dirigé par le maréchal Pétain.", "lat": 46.1167, "lng": 3.4167},
    {"id": 170, "event": "Capitale de la Chaussure", "date": "XIXe siècle", "city": "Romans-sur-Isère", "description": "Ville renommée pour son industrie et son musée de la chaussure.", "lat": 45.0464, "lng": 5.0562},
    {"id": 171, "event": "Reconquête de Toulon", "date": "1793", "city": "Toulon", "description": "Première grande victoire militaire du jeune Bonaparte face aux Anglais.", "lat": 43.1242, "lng": 5.9280},
    {"id": 172, "event": "Forum Julii", "date": "Antiquité", "city": "Fréjus", "description": "Port militaire romain fondé par Jules César pour rivaliser avec Marseille.", "lat": 43.4330, "lng": 6.7370},
    {"id": 173, "event": "Foire de Beaucaire", "date": "Moyen Âge", "city": "Beaucaire", "description": "Ville accueillant une foire internationale majeure en Europe au Moyen Âge.", "lat": 43.8081, "lng": 4.6442},
    {"id": 174, "event": "Imprimerie Lyonnaise", "date": "Renaissance", "city": "Lyon", "description": "Centre européen majeur de l'édition et de l'humanisme au XVIe siècle.", "lat": 45.764, "lng": 4.8357},
    {"id": 175, "event": "Vase de Soissons", "date": "486", "city": "Soissons", "description": "Ville associée à la célèbre anecdote de Clovis brisant un vase après une bataille.", "lat": 49.3817, "lng": 3.3236},
    {"id": 176, "event": "Base de Kéroman", "date": "1941", "city": "Lorient", "description": "Ville abritant la plus grande base de sous-marins allemands (U-Boots) de l'Atlantique.", "lat": 47.7483, "lng": -3.3702},
    {"id": 177, "event": "Congrès de Tours (Rappel)", "date": "1920", "city": "Tours", "description": "Moment fondateur du communisme français.", "lat": 47.3941, "lng": 0.6848},
    {"id": 178, "event": "Nemausus", "date": "Antiquité", "city": "Nîmes", "description": "Ville romaine importante située sur la Via Domitia.", "lat": 43.8367, "lng": 4.3601},
    {"id": 179, "event": "Remparts de Briançon", "date": "XVIIIe siècle", "city": "Briançon", "description": "Ensemble fortifié spectaculaire de Vauban pour défendre les Alpes.", "lat": 44.8964, "lng": 6.6356},
    {"id": 180, "event": "Haute Banque", "date": "XIXe siècle", "city": "Paris", "description": "Ville centre de la finance européenne (Rothschild, Pereire).", "lat": 48.8566, "lng": 2.3522},
    {"id": 181, "event": "Narbo Martius", "date": "Antiquité", "city": "Narbonne", "description": "Première colonie romaine fondée en Gaule (-118).", "lat": 43.1843, "lng": 3.0031},
    {"id": 182, "event": "Exposition Coloniale", "date": "1931", "city": "Paris", "description": "Grande manifestation à la Porte Dorée célébrant l'Empire colonial français.", "lat": 48.8566, "lng": 2.3522},
    {"id": 183, "event": "Bataille de Saint-Privat", "date": "1870", "city": "Metz", "description": "Bataille sanglante aux portes de Metz lors de la guerre franco-prussienne.", "lat": 49.1193, "lng": 6.1757},
    {"id": 184, "event": "Lugdunum Convenarum", "date": "Antiquité", "city": "Saint-Bertrand-de-Comminges", "description": "Site antique majeur au pied des Pyrénées avec des thermes et un théâtre.", "lat": 43.0266, "lng": 0.5709},
    {"id": 185, "event": "Airbus", "date": "XXe siècle", "city": "Toulouse", "description": "Siège mondial du constructeur aéronautique européen.", "lat": 43.6047, "lng": 1.4442},
    {"id": 186, "event": "Château d'Angers", "date": "Moyen Âge", "city": "Angers", "description": "Forteresse aux 17 tours abritant la Tenture de l'Apocalypse.", "lat": 47.4784, "lng": -0.5632},
    {"id": 187, "event": "Grèves de Carmaux", "date": "1892", "city": "Carmaux", "description": "Conflit social emblématique soutenu par Jean Jaurès.", "lat": 44.0510, "lng": 2.1580},
    {"id": 188, "event": "Vierge du Puy", "date": "Moyen Âge", "city": "Le Puy-en-Velay", "description": "Sanctuaire marial vénéré depuis le Moyen Âge.", "lat": 45.0437, "lng": 3.8852},
    {"id": 189, "event": "Complexe de Fos", "date": "XXe siècle", "city": "Fos-sur-Mer", "description": "Création d'un gigantesque port industriel et pétrolier près de Marseille.", "lat": 43.4377, "lng": 4.9446},
    {"id": 190, "event": "Reddition de 1945", "date": "7 mai 1945", "city": "Reims", "description": "Signature de l'acte de capitulation de l'Allemagne nazie au musée de la Reddition.", "lat": 49.2583, "lng": 4.0317}
]

file_path = '/Users/blaiserubin/Applications/Ville de France V1/src/data/history_cities.json'

# Read existing data script
try:
    with open(file_path, 'r', encoding='utf-8') as f:
        existing_data = json.load(f)
except Exception as e:
    existing_data = []

# Merge
final_data = existing_data + new_data

# Deduplicate by ID just in case
unique_data = {item['id']: item for item in final_data}.values()
final_list = list(unique_data)

# Write back
with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(final_list, f, ensure_ascii=False, indent=4)

print(f"Successfully updated {file_path} with {len(final_list)} items.")
