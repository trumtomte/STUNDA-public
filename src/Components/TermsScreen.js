// Dependencies
import React, { Component } from "react"
import { connect } from "react-redux"
import { FONT, resetAction } from "../utils"
import { acceptTerms } from "../ducks/user"
import { setCurrentSurvey } from "../ducks/survey"
import IconIonicons from "react-native-vector-icons/Ionicons"
import LogoutButton from "./LogoutButton"
import {
    StyleSheet,
    View,
    ScrollView,
    Text,
    TouchableOpacity,
    CheckBox,
    ActivityIndicator,
    Dimensions
} from "react-native"

const WIDTH = Dimensions.get("window").width

// Component
// =========
class TermsScreen extends Component {
    static navigationOptions = props => {
        const title = props.navigation.getParam("title", "Användarvillkor")
        const type = props.navigation.getParam("type", "terms")

        return {
            title: title,
            headerStyle: {
                elevation: 0,
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: "#aaaaaa"
            },
            headerRight: <LogoutButton />,
            headerTitleStyle: { fontFamily: FONT, alignSelf: "center" },
            headerLeft: (
                <View style={s.step}>
                    <Text style={s.stepTxt}>
                    {type === "terms" ? "1/2" : type === "consent" ? "2/2" : ""}
                    </Text>
                </View>
            ),
            gesturesEnabled: false
        }
    }

    state = {
        loading: false
    }

    constructor(props) {
        super(props)
    }

    finish = () => {
        this.props.setCurrentSurvey("start")
        this.props.navigation.dispatch(resetAction("SurveyScreen", {
            type: "start",
            step: 1,
            steps: this.props.surveys.start.steps
        }))
    }

    onAcceptTerms = () => {
        if (this.state.loading) {
            return false
        }

        const done = d => {
            this.setState({ loading: false })

            if (d) {
                this.props.navigation.navigate("TermsScreen", { title: "Samtycke", type: "consent" })
            } else {
                // NOTE: this silently fails
            }
        }

        this.setState({ loading: true })

        // If the user has already accepted the terms of service
        if (this.props.tos) {
            if (this.props.startSurvey) {
                this.props.navigation.dispatch(resetAction("HomeScreen"))
            } else {
                this.finish()
            }
        } else {
            this.props.acceptTerms(done)
        }
    }

    onAcceptConsent = () => {
        this.props.navigation.navigate("TermsScreen", {
            title: "Kom igång",
            type: "done"
        })
    }

    onDone = () => {
        if (this.props.startSurvey) {
            this.props.navigation.dispatch(resetAction("HomeScreen"))
        } else {
            this.finish()
        }
    }

    renderTermsButton = () => {
        if (this.state.loading) {
            return (
                <View style={s.loading}>
                    <ActivityIndicator animating={true} size="small" />
                </View>
            )
        }

        return (
            <TouchableOpacity
                onPress={this.onAcceptTerms}
                activeOpacity={0.6}
                style={s.button}>
                <Text style={s.buttonText}>
                    Jag har läst och godkänner villkoren 
                </Text>
            </TouchableOpacity>
        )
    }

    renderConsentButton = () => {
        if (this.state.loading) {
            return (
                <View style={s.loading}>
                    <ActivityIndicator animating={true} size="small" />
                </View>
            )
        }

        return (
            <TouchableOpacity
                onPress={this.onAcceptConsent}
                activeOpacity={0.6}
                style={s.button}>
                <Text style={s.buttonText}>
                    Jag samtycker till att delta i studien
                </Text>
            </TouchableOpacity>
        )
    }

    renderDoneButton = () => {
        if (this.state.loading) {
            return (
                <View style={s.loading}>
                    <ActivityIndicator animating={true} size="small" />
                </View>
            )
        }

        return (
            <TouchableOpacity
                onPress={this.onDone}
                activeOpacity={0.6}
                style={s.button}>
                <Text style={[s.buttonText, { fontSize: 18 }]}>
                    Starta
                </Text>
            </TouchableOpacity>
        )
    }

    renderTerms = () => {
        return (
            <View>
                <View style={s.bulletContainer}>
                    <Text style={s.bullet}>
                        1. Allmänt
                    </Text>
                </View>

                <View style={s.textContainer}>
                    <Text style={s.text}>
                        1.1 Malmö universitet (org nr: 2021004920)
                        tillhandahåller tjänsten STUNDA som syftar till att
                        samla in data om trygghet från personer som samtyckt
                        till att delta i forskningsstudien STUNDA: Att
                        undersöka upplevelser av situationell otrygghet genom
                        smarta telefoner bland unga vuxna i Malmö.  Tjänsten
                        tillhandahålls genom en mobilapplikation.  Dessa
                        användarvillkor utgör ett avtal mellan Malmö
                        universitet och Användaren av Tjänsten (STUNDA) som har
                        registrerat ett användarkonto i STUNDA. 
                    </Text>
                </View>

                <View style={s.textContainer}>
                    <Text style={s.text}>
                        1.2 Genom att godkänna Avtalet i samband med sin
                        registrering försäkrar Användaren att denne läst
                        igenom och godkänt avtalet och accepterar att
                        dennes rättigheter och skyldigheter avseende
                        Tjänsten regleras av avtalet och förbinder sig
                        därmed att följa avtalet.
                    </Text>
                </View>

                <View style={s.textContainer}>
                    <Text style={s.text}>
                        1.3 Genom att godkänna avtalet bekräftar Användaren
                        att denna företräder sig själv och inte
                        representerar någon annan i avtalsrelationen.
                    </Text>
                </View>

                <View style={s.textContainer}>
                    <Text style={s.text}>
                        1.4 Användaren får tillgång till Tjänsten via App
                        Store eller Google Play.
                    </Text>
                </View>

                <View style={s.textContainer}>
                    <Text style={s.text}>
                        1.5 Malmö universitet ansvarar för Tjänstens
                        innehåll samt hantering och lagring av data (se
                        vidare under avsnitt 6). En extern aktör, Doris HB,
                        ansvarar för Tjänstens utformning och underhåll
                        vilket regleras i avtal mellan Malmö universitet
                        och Doris HB. Doris HB har inte tillgång till de
                        data som samlas in med hjälp av Tjänsten. Malmö
                        universitet använder de data som samlas in i
                        enlighet med den information som delgivits
                        Användaren vid den samtyckesprocedur som äger rum
                        innan Användaren ges tillgång till Tjänsten. Malmö
                        universitet använder endast insamlade data i
                        forskningssyfte.
                    </Text>
                </View>

                <View style={s.textContainer}>
                    <Text style={s.text}>
                        1.6 Tillgång till Tjänsten sker genom de unika
                        inloggningsuppgifter som Malmö universitet
                        tillhandahåller när Användaren givit sitt samtycke
                        till att delta i studien.
                    </Text>
                </View>

                <View style={s.bulletContainer}>
                    <Text style={s.bullet}>
                        2. Användning av Tjänsten
                    </Text>
                </View>

                <View style={s.textContainer}>
                    <Text style={s.text}>
                        2.1 För att kunna använda Tjänsten krävs att
                        Användaren loggar in i STUNDA mobilapplikation. Vid
                        inloggning ska Användaren uppge de
                        inloggningsuppgifter som tillhandahållits av Malmö
                        universitet. Om Användaren saknar eller har
                        förlorat sina inloggningsuppgifter ska Användaren
                        kontakta Malmö universitet. Tjänsten kan inte
                        användas utan inloggningsuppgifter.
                    </Text>
                </View>

                <View style={s.textContainer}>
                    <Text style={s.text}>
                        2.2 Användaren ansvarar för att denne har rätt att
                        använda externa inloggningsuppgifter och
                        information i Tjänsten. Användaren ansvarar även
                        för att dennes inloggningsuppgifter inte sprids
                        till eller används av obehöriga.
                    </Text>
                </View>

                <View style={s.textContainer}>
                    <Text style={s.text}>
                        2.3 Användningen av STUNDA är kostnadsfri.
                        Trafikavgifter till Användarens mobiloperatör eller
                        internetleverantör kan tillkomma och dessa åligger
                        Användaren.
                    </Text>
                </View>

                <View style={s.textContainer}>
                    <Text style={s.text}>
                        2.4 Malmö universitet kan när som helst revidera
                        eller ändra Tjänsten. Malmö universitet försöker
                        att alltid meddela Användaren om eventuella
                        ändringar via App Store och Google Play. Malmö
                        universitet förbehåller sig rätten att genomföra
                        sådana förändringar med omedelbar verkan för att
                        upprätthålla säkerhet i sitt system eller för att
                        följa regler eller förordningar.
                    </Text>
                </View>

                <View style={s.bulletContainer}>
                    <Text style={s.bullet}>
                        3. Användarens licens till STUNDA
                    </Text>
                </View>

                <View style={s.textContainer}>
                    <Text style={s.text}>
                        3.1 Malmö universitet upplåter till Användaren
                        inloggningsuppgifter för Tjänsten. Utan dessa
                        inloggningsuppgifter kan inte Tjänsten användas.
                        Användaren har rätt att ladda ner och installera
                        uppdateringar av Tjänsten.
                    </Text>
                </View>

                <View style={s.textContainer}>
                    <Text style={s.text}>
                        3.2 Användaren har inte rätt att (1) överlåta,
                        licensiera, kopiera, publicera eller distribuera
                        Tjänsten; (2) tillåta tredje part att använda
                        Tjänsten; (3) överlåta rättigheter som Användaren
                        erhållit enligt avtalet; eller (4) kringgå någon av
                        de tekniska begränsningarna av Tjänsten, eller
                        dekompilera eller på annat sätt omkonstruera
                        Tjänsten, såvida inte annat följer av tvingande
                        lag.
                    </Text>
                </View>

                <View style={s.textContainer}>
                    <Text style={s.text}>
                        3.3 Användaren ansvarar för och garanterar att: (1)
                        Informationen som Användaren laddar upp eller
                        lägger in i Tjänsten inte gör intrång i tredje
                        parts rättigheter eller annars står i strid med lag
                        eller tredje parts rätt; (2) Att de externa
                        inloggningsuppgifter som tillhandahållits av Malmö
                        universitet endast brukas av Användaren. All
                        överlåtelse av inloggningsuppgifter är otillåten
                        och medför att Tjänsten kan stängas ned av Malmö
                        universitet.
                    </Text>
                </View>

                <View style={s.bulletContainer}>
                    <Text style={s.bullet}>
                        4. Malmö universitets tillhandahållande av STUNDA
                    </Text>
                </View>

                <View style={s.textContainer}>
                    <Text style={s.text}>
                        4.1 STUNDA tillhandahålls normalt 24 timmar per
                        dygn, sju dagar i veckan. Malmö universitet
                        garanterar emellertid inte att Tjänsten är fri från
                        fel, avbrott eller "buggar" under denna tid.
                    </Text>
                </View>
                <View style={s.textContainer}>
                    <Text style={s.text}>
                        4.2 Från tid till annan utförs underhåll på och
                        uppgraderingar av STUNDA, vilket kan resultera i
                        avbrott, förseningar eller fel i Tjänsten. Malmö
                        universitet försöker alltid att på förhand meddela
                        om planerade underhåll, men kan inte garantera att
                        meddelande härom alltid kommer att tillhandahållas.
                    </Text>
                </View>
                <View style={s.textContainer}>
                    <Text style={s.text}>
                        4.3 Användaren är införstådd med risken för fel,
                        avbrott samt att underhåll/uppgraderingar kommer
                        att utföras och accepterar att Malmö universitet
                        tar kontakt i syfte att ge Användaren hjälp med
                        Tjänsten eller att Malmö universitet begär
                        information som behövs för att identifiera och
                        åtgärda fel.
                    </Text>
                </View>
                <View style={s.textContainer}>
                    <Text style={s.text}>
                        4.4 Användarens tillgång till STUNDA är beroende av
                        tjänster från tredje part, så som
                        mobiltelefonitjänster. Malmö universitet har inget
                        ansvar för sådana tjänsters utförande.
                    </Text>
                </View>

                <View style={s.bulletContainer}>
                    <Text style={s.bullet}>
                        5. Ansvarsbegräsningar
                    </Text>
                </View>

                <View style={s.textContainer}>
                    <Text style={s.text}>
                        5.1 Tjänsten innebär endast att data samlas in i
                        enlighet med den information som delgivits
                        Användaren i samtyckesproceduren. Det finns ingen
                        funktion eller koppling till polisen eller andra
                        myndigheter och Tjänsten övervakas inte i realtid.
                        Användaren ska aldrig använda Tjänsten under
                        omständigheter där det föreligger risk eller fara
                        för Användarens eller annan persons liv och hälsa
                        eller egendom. Malmö universitet ansvarar inte för
                        att användare felaktigt använder tjänsten, till
                        exempel i förhoppning om att komma i kontakt med
                        polisen eller andra myndigheter.
                    </Text>
                </View>
                <View style={s.textContainer}>
                    <Text style={s.text}>
                        5.2 Malmö universitet ansvarar inte under några
                        omständigheter för indirekt skada, utebliven vinst,
                        förlust av data eller andra förluster i samband med
                        användningen av eller utebliven användning av
                        Tjänsten.
                    </Text>
                </View>
                <View style={s.textContainer}>
                    <Text style={s.text}>
                        5.3 Malmö universitet ansvarar för Användarens
                        skador om dessa beror på Malmö universitets uppsåt
                        eller grova oaktsamhet, eller annat som Malmö
                        universitet enligt lag ej kan undandra sig, eller
                        försöka undandra sig, ansvar för.
                    </Text>
                </View>
                <View style={s.textContainer}>
                    <Text style={s.text}>
                        5.4 Malmö universitet är endast ansvariga för
                        skador som beror på Malmö universitets eget fel och
                        åtar sig inget ansvar för någon tredje parts
                        handling eller underlåtenhet till handling. Malmö
                        universitet ansvarar inte i något fall för skador
                        eller förluster för Användaren som beror på Malmö
                        universitets skyldighet att följa tillämpliga lagar
                        och regler, handling eller underlåtenhet av
                        myndighet, krig, olycka, naturkatastrof, strejk,
                        blockad, eller annan liknande omständighet, oavsett
                        om Malmö universitet ligger bakom sådan
                        omständighet eller är föremål för den.
                    </Text>
                </View>

                <View style={s.bulletContainer}>
                    <Text style={s.bullet}>
                        6. Personuppgifter samt hantering och lagring av
                        data
                    </Text>
                </View>

                <View style={s.textContainer}>
                    <Text style={s.text}>
                        6.1 Malmö universitet samlar inte in några
                        personuppgifter från användarna.
                    </Text>
                </View>
                <View style={s.textContainer}>
                    <Text style={s.text}>
                        6.2 Genom Tjänsten samlar Malmö universitet in data
                        som Användaren aktivt bidrar med genom att besvara
                        olika frågeformulär.
                    </Text>
                </View>
                <View style={s.textContainer}>
                    <Text style={s.text}>
                        6.3 Data samlas även in automatiskt via
                        mobiltelefonens tjänster (GPS och klocka).
                        Användaren är medveten om detta genom
                        samtyckesproceduren samt genom att godkänna
                        Tjänstens behörigheter i Användarens mobiltelefon.
                    </Text>
                </View>
                <View style={s.textContainer}>
                    <Text style={s.text}>
                        6.4 Alla data lagras på Malmö universitets servrar.
                        Endast forskargruppen har tillgång till dessa data.
                        Eftersom inga personuppgifter samlas in kan ingen
                        (inkl. forskargruppen) koppla insamlade data till
                        en specifik individ.
                    </Text>
                </View>

                <View style={s.bulletContainer}>
                    <Text style={s.bullet}>
                        7. Avtal och uppsägning
                    </Text>
                </View>

                <View style={s.textContainer}>
                    <Text style={s.text}>
                        7.1 Avtalet mellan Malmö universitet och Användaren
                        gäller tills vidare. Användaren har rätt att när
                        som helst avsluta sitt konto och därmed säga upp
                        avtalet med omedelbar verkan. Malmö universitet har
                        rätt att när som helst säga upp avtalet och/eller
                        sluta att tillhandhålla STUNDA.
                    </Text>
                </View>
                <View style={s.textContainer}>
                    <Text style={s.text}>
                        7.2 Malmö universitet har rätt att spärra
                        Användarens konto, vägra denne tillgång till STUNDA
                        och/eller häva avtalet med omedelbar verkan, om (1)
                        det kommer till Malmö universitets kännedom eller
                        att Malmö universitet annars har skälig anledning
                        att anta att Användaren använder eller kommer att
                        använda tjänsten i strid mot avtalet eller annars
                        mot gällande lag eller föreskrift, (2) det
                        framkommit sådana uppgifter rörande tekniska eller
                        administrativa rutiner för informationssäkerhet att
                        det finns skälig anledning att befara att
                        Användarens konto kommer att missbrukas, (3) det
                        annars finns skälig anledning att anta att
                        Användarens konto har missbrukats eller kommer att
                        missbrukas, (4) eller om Användaren återkallar sitt
                        samtycke till deltagande i forskningsstudien.
                    </Text>
                </View>

                <View style={s.bulletContainer}>
                    <Text style={s.bullet}>
                        8. Överlåtelse
                    </Text>
                </View>

                <View style={s.textContainer}>
                    <Text style={s.text}>
                        8.1 Varken Användaren eller Malmö universitet får
                        lov att överlåta rättigheter eller skyldigheter
                        kopplade till detta avtal utan att först inhämta
                        den andra partens skriftliga godkännande.
                    </Text>
                </View>

                {this.renderTermsButton()}
            </View>
        )
    }

    renderConsent = () => {
        return (
            <View>
                <View style={s.bulletContainer}>
                    <Text style={s.bullet}>
                        1. STUNDA: Att undersöka upplevelser av situationell otrygghet genom smarta telefoner bland unga vuxna i Malmö
                    </Text>
                </View>

                <View style={s.textContainer}>
                    <Text style={s.text}>
                        Välkommen till forskningsprojektet STUNDA! Innan du kan komma igång och använda STUNDA vill vi att du tar del av information om projektet, instruktioner om hur du använder STUNDA och hur den information som samlas in hanteras. Innan du börjar använda STUNDA är det även viktigt att du samtycker till att delta i studien. Du kan när som helst kontakta forskarlaget via stunda@mau.se.
                    </Text>
                </View>

                <View style={s.bulletContainer}>
                    <Text style={s.bullet}>
                        2. Introduktion
                    </Text>
                </View>

                <View style={s.textContainer}>
                    <Text style={s.text}>
                        STUNDA är ett forskningsprojekt om (o)trygghet som bedrivs av institutionen för kriminologi vid Malmö universitet. Syftet med studien är att undersöka möjligheterna att samla information om (o)trygghet genom smarta telefoner men även att undersöka situationer där (o)trygghet upplevs. STUNDA (Situationell TrygghetsUNDersökningsApplikation) är även namnet på den mobilapplikation som används i projektet för att samla information om trygghetsupplevelser i olika situationer. Enkätfrågorna och STUNDAs funktioner beskrivs kortfattat här och mer information om projektet finns på www.mau.se/stunda.
                    </Text>
                </View>

                <View style={s.bulletContainer}>
                    <Text style={s.bullet}>
                        3. Information om startenkäten
                    </Text>
                </View>

                <View style={s.textContainer}>
                    <Text style={s.text}>
                        Nu när du har loggat in i STUNDA kommer du först fylla i en något längre startenkät. Denna enkät innehåller bl.a. frågor om vem du är och hur du spenderar din tid samt frågor om otrygghet, oro och utsatthet för brott. STUNDA samlar automatiskt information om tidpunkten då du skickar in enkäten.
                    </Text>
                </View>

                <View style={s.bulletContainer}>
                    <Text style={s.bullet}>
                        4. Information om snabbenkäten
                    </Text>
                </View>

                <View style={s.textContainer}>
                    <Text style={s.text}>
                        Du kommer att få push-notiser skickade till din telefon från STUNDA tre gånger per dag mellan 07:30 och 22:30. När du får en notis ombeds du att besvara en snabbenkät om var du är, vad du gör, med vem du är och din trygghetsupplevelse "just nu". Enkäten tar ca 1 minut att fylla i och finns tillgänglig via huvudmenyn i 20 minuter från det att du har mottagit push-notisen. STUNDA samlar automatiskt information om var du befinner dig (men inte om du är hemma) och vad klockan är när du besvarar enkäten.
                    </Text>
                </View>

                <View style={s.bulletContainer}>
                    <Text style={s.bullet}>
                        5. Information om händelserapportering
                    </Text>
                </View>

                <View style={s.textContainer}>
                    <Text style={s.text}>
                        Du kan även när som helst själv öppna STUNDA och rapportera en händelse då du har känt dig otrygg. STUNDA samlar automatiskt information om när du besvarar enkäten, men inte information om din plats vid detta tillfälle utan det får du rapportera manuellt (men inte om du är hemma). 
                    </Text>
                </View>

                <View style={s.bulletContainer}>
                    <Text style={s.bullet}>
                        6. Information om den dagliga enkäten
                    </Text>
                </View>

                <View style={s.textContainer}>
                    <Text style={s.text}>
                        I slutet av varje dag kommer STUNDA påminna dig genom en push-notis om att fylla i en daglig enkät där det ställs ett par frågor om din trygghetsupplevelse under de gångna 24 timmarna. Denna enkät besvarar du på kvällen och den tar ett par minuter att genomföra. STUNDA samlar automatiskt information om när du fyller i enkäten, men inte information om din plats vid detta tillfälle utan det får du rapportera manuellt om du upplevt en otrygg händelse kopplat till en specifik plats (utanför ditt hem).
                    </Text>
                </View>

                <View style={s.bulletContainer}>
                    <Text style={s.bullet}>
                        7. Hantering av data
                    </Text>
                </View>

                <View style={s.textContainer}>
                    <Text style={s.text}>
                        När du fyller i en enkät i STUNDA så skickas informationen krypterat till en server på Malmö universitet där materialet även förvaras. När datainsamlingen är avslutad kommer materialet tömmas från servern och sparas elektroniskt på en hårddisk inlåst i ett säkerhetsskåp vid Malmö universitet.
                    </Text>
                </View>
                <View style={s.textContainer}>
                    <Text style={s.text}>
                        Malmö universitet ansvarar för alla insamlade data och delar aldrig med sig av dessa till tredje part. Eftersom STUNDA inte samlar in personuppgifter kan inga svar kopplas till dig. Ditt deltagande är helt anonymt.
                    </Text>
                </View>

                <View style={s.bulletContainer}>
                    <Text style={s.bullet}>
                        8. Samtycke
                    </Text>
                </View>

                <View style={s.textContainer}>
                    <Text style={s.text}>
                        För att delta i studien krävs att du samtycker till att vara med. Nu följer mer utförlig information om vad deltagandet innebär för dig. I slutet ber vi dig att kryssa i en ruta om du samtycker. Om du inte samtycker ber vi dig att avinstallera STUNDA från din telefon.
                    </Text>
                </View>

                <View style={s.bulletContainer}>
                    <Text style={s.bullet}>
                        9. Projektinformation till forskningspersonerna
                    </Text>
                </View>
                <View style={s.textContainer}>
                    <Text style={[s.text, s.boldItalic]}>
                        Vad är STUNDA?
                    </Text>
                </View>
                <View style={s.textContainer}>
                    <Text style={s.text}>
                        STUNDA är ett forskningsprojekt om (o)trygghet som bedrivs av institutionen för kriminologi vid Malmö universitet. Syftet med studien är att undersöka möjligheterna att samla information om (o)trygghet genom smarta telefoner men även att undersöka situationer där (o)trygghet upplevs. STUNDA (Situationell TrygghetsUNDersökningsApplikation) är även namnet på den mobilapplikation som används i projektet för att samla information om trygghetsupplevelser i olika situationer.
                    </Text>
                </View>
                <View style={s.textContainer}>
                    <Text style={[s.text, s.boldItalic]}>
                        Hur ser mitt deltagande ut?
                    </Text>
                </View>
                <View style={s.textContainer}>
                    <Text style={s.text}>
                        om deltagare besvarar du enkätfrågor relaterat till situationer och (o)trygghet genom STUNDA. Först behöver du ladda ner STUNDA i Appstore eller Google Play. Sen behöver du ta en lapp med användarnamn och lösenord. Tänk på att spara denna information eftersom du är den enda som har tillgång till ditt användarnamn och lösenord (av anonymitetsskäl).
                    </Text>
                </View>
                <View style={s.textContainer}>
                    <Text style={s.text}>
                        Ditt deltagande pågår så länge du vill men helst under minst 14 dagar. Du kan när som helst avsluta ditt deltagande och sluta få enkäter genom att avinstallera STUNDA från din telefon.
                    </Text>
                </View> 
                <View style={s.textContainer}>
                    <Text style={[s.text, s.boldItalic]}>
                        Hur fungerar STUNDA?
                    </Text>
                </View> 
                <View style={s.textContainer}>
                    <Text style={s.text}>
                        Första gången du öppnar STUNDA och loggar in så kommer du fylla i en något längre <Text style={{ fontStyle: "italic" }}>Startenkät</Text> med frågor om vem du är och hur du spenderar din tid samt frågor om otrygghet, oro och utsatthet för brott. 
                    </Text>
                </View> 
                <View style={s.textContainer}>
                    <Text style={s.text}>
                        STUNDA kommer sen skicka push-notiser till dig tre gånger varje dag (mellan 07:30-22:30) där du ombeds fylla i en <Text style={{ fontStyle: "italic" }}>Snabbenkät</Text> med ett par korta frågor om var du är, vad du gör och med vem du är samt din trygghetsupplevelse vid det specifika tillfället. Denna enkät tar ca en minut att fylla i.
                    </Text>
                </View> 
                <View style={s.textContainer}>
                    <Text style={s.text}>
                        I slutet av varje dag kommer STUNDA även påminna dig genom en push-notis att fylla i en <Text style={{ fontStyle: "italic"}}>Daglig enkät</Text> där det ställs ett par frågor om din trygghetsupplevelse under de gångna 24 timmarna. Denna enkät tar ett par minuter att besvara och fylls i innan du går och lägger dig. 
                    </Text>
                </View> 
                <View style={s.textContainer}>
                    <Text style={s.text}>
                        STUNDA kan du även själv rapportera situationer eller händelser som du upplevt som otrygga med hjälp av funktionen <Text style={{ fontStyle: "italic" }}>Händelserapportering</Text>.
                    </Text>
                </View> 
                <View style={s.textContainer}>
                    <Text style={[s.text, s.boldItalic]}>
                        Vilken information samlar STUNDA?
                    </Text>
                </View> 
                <View style={s.textContainer}>
                    <Text style={s.text}>
                        Utöver svaren som du anger i de olika enkäterna samlar STUNDA även automatiskt in information om tidpunkten när du besvarar samtliga enkäter. När du fyller i <Text style={{ fontStyle: "italic" }}>Snabbenkäten</Text> samlar STUNDA även automatisk information om din geografiska plats. Om du uppger att du är ”Hemma” vid tillfället så samlar STUNDA dock ingen geografisk information (av integritetsskäl).
                    </Text>
                </View> 
                <View style={s.textContainer}>
                    <Text style={[s.text, s.boldItalic]}>
                        Vilka funktioner i min telefon behöver STUNDA ha tillgång till?
                    </Text>
                </View> 
                <View style={s.textContainer}>
                    <Text style={s.text}>
                        STUNDA behöver ha tillgång till telefonens geografiska position (platsåtkomst) och även tillåtas skicka notiser för att påminna om när det är dags att besvara enkäter. Det är viktigt att knappen ”Notifikationer” i huvudmenyn (längst ner till vänster) lyser grön. Om du är osäker på om du tillåtit STUNDA åtkomst till dessa funktioner kan du gå in i telefonens inställningar och kontrollera under de specifika inställningarna för STUNDA.
                    </Text>
                </View> 
                <View style={s.textContainer}>
                    <Text style={[s.text, s.boldItalic]}>
                        Är jag anonym?
                    </Text>
                </View> 
                <View style={s.textContainer}>
                    <Text style={s.text}>
                        Eftersom du är den enda som har tillgång till ditt användarnamn och lösenord så är det inte möjligt att koppla information som lämnas genom STUNDA till dig. Den information som du lämnar är alltså anonym.
                    </Text>
                </View> 
                <View style={s.textContainer}>
                    <Text style={[s.text, s.boldItalic]}>
                        Hur behandlas och förvaras det insamlade materialet?
                    </Text>
                </View> 
                <View style={s.textContainer}>
                    <Text style={s.text}>
                        När du fyller i en enkät i STUNDA så skickas informationen krypterat till en server på Malmö universitet där materialet även förvaras. När datainsamlingen är avslutad kommer materialet tömmas från servern och sparas elektroniskt på en hårddisk inlåst i ett säkerhetsskåp vid Malmö universitet.
                    </Text>
                </View> 
                <View style={s.textContainer}>
                    <Text style={[s.text, s.boldItalic]}>
                        Finns det några risker och fördelar för dig som deltagare?
                    </Text>
                </View> 
                <View style={s.textContainer}>
                    <Text style={s.text}>
                        Deltagandet i studien innebär inga risker för din fysiska hälsa. Eftersom studien undersöker otrygghet kan du dock komma att tänka mer på just otrygghet vilket du kanske inte gör i vanliga fall. Detta kan i längden innebära att du som deltagare blir mer medveten om och påverkad av dina upplevelser av otrygghet. Om du upplever att ditt deltagande medför obehag kan du alltid avbryta din medverkan (mer om detta under nästa rubrik). Hos Brottsoffermyndigheten finns kontaktuppgifter till olika organisationer och myndigheter dit du kan vända dig anonymt för att få stöd och hjälp (www.brottsoffermyndigheten.se/2803). Du kan även vända dig till studenthälsan på Malmö universitet (https://www.mah.se/ar-student/Stod-och-service/Studenthalsan/). Mer information finns även på www.mau.se/stunda. Vill du prata med forskarlaget om konsekvenserna av ditt deltagande kan du alltid vända dig till oss via e-post (stunda@mau.se) eller per telefon (Alexander Engström, 040-66 58622; Karl Kronkvist 040-66 58215).
                    </Text>
                </View> 
                <View style={s.textContainer}>
                    <Text style={s.text}>
                        Det finns inga direkta fördelar för dig som deltar i projektet. Däremot kan du genom ditt deltagande bidra till ökad kunskap om vilka situationer och platser som påverkar känslan av otrygghet. Detta kan i förlängningen bidra till en positiv samhällsutveckling om dessa kunskaper omsätts i trygghetsskapande åtgärder.
                    </Text>
                </View> 
                <View style={s.textContainer}>
                    <Text style={[s.text, s.boldItalic]}>
                        Hur avbryter jag min medverkan?
                    </Text>
                </View> 
                <View style={s.textContainer}>
                    <Text style={s.text}>
                        Du kan när som helst, utan att uppge anledning, avsluta ditt deltagande i studien. Detta gör du helt enkelt genom att avinstallera STUNDA från din telefon. Vi kan också ta bort dina enkätsvar från vårt insamlade material men då behöver du höra av dig till oss på stunda@mau.se och bifoga ditt användarnamn och lösenord (dock senast 2018-12-31).
                    </Text>
                </View> 
                <View style={s.textContainer}>
                    <Text style={[s.text, s.boldItalic]}>
                        Hur presenteras studiens resultat?
                    </Text>
                </View> 
                <View style={s.textContainer}>
                    <Text style={s.text}>
                        Studiens resultat kommer att rapporteras skriftligen i form av forskningsrapporter och artiklar i vetenskapliga tidskrifter. Resultat kommer även presenteras muntligen vid olika vetenskapliga konferenser och andra (populär)vetenskapliga sammanhang. Resultat från studien kommer även publiceras på www.mau.se/stunda. Resultat kommer inte presenteras på ett sådant sätt att enskilda individer kan identifieras.
                    </Text>
                </View> 
                <View style={s.textContainer}>
                    <Text style={[s.text, s.boldItalic]}>
                        Mer information?
                    </Text>
                </View> 
                <View style={s.textContainer}>
                    <Text style={s.text}>
                        Du hittar mer information på www.mau.se/stunda. Har du några frågor eller funderingar är du välkommen att höra av dig till forskarlaget via e-post (stunda@mau.se) eller per telefon (Alexander Engström, 040-66 58622; Karl Kronkvist 040-66 58215). Forskningens huvudman är Malmö universitet (Malmö universitet, 205 06 Malmö, telefon 040-665 70 10, e-post info@mau.se).
                    </Text>
                </View> 

                <View style={s.bulletContainer}>
                    <Text style={s.bullet}>
                        10. Samtycke till deltagande
                    </Text>
                </View>

                <View style={s.textContainer}>
                    <Text style={s.text}>
                        Genom att klicka på "Jag samtycker till att delta i studien" nedan bekräftar du att du har tagit del av den skriftliga information du fått i mobilapplikationen och som även finns tillgänglig på www.mau.se/stunda och samtycker till deltagande i studien. Ditt deltagande i studien är helt frivilligt. Du kan när som helst, utan att behöva ange någon anledning, avsluta din medverkan genom att ta bort STUNDA från din telefon.
                    </Text>
                </View>

                <View style={s.textContainer}>
                    <Text style={[s.text, s.boldItalic]}>
                        Om du inte samtycker
                    </Text>
                </View> 

                <View style={s.textContainer}>
                    <Text style={s.text}>
                        Om du inte samtycker till deltagande ber vi dig stänga applikationen och avinstallera STUNDA från din telefon. Har du några frågor eller funderingar är du välkommen att höra av dig till forskarlaget via e-post (stunda@mau.se) eller per telefon (Alexander Engström, 040-66 58622; Karl Kronkvist 040-66 58215). Forskningens huvudman är Malmö universitet (Malmö universitet, 205 06 Malmö, telefon 040-665 70 10, e-post info@mau.se).
                    </Text>
                </View>

                {this.renderConsentButton()}
            </View>
        )
    }

    renderDone = () => {
        return (
            <View>
                <View style={s.bulletContainer}>
                    <Text style={s.bullet}>
                        11. Kom igång med STUNDA
                    </Text>
                </View>

                <View style={s.textContainer}>
                    <Text style={s.text}>
                        Nu kan du komma igång och använda STUNDA. Du hittar all information om projektet och applikationen på www.mau.se/stunda. Denna information når du även genom att klicka på ”Mer information” i STUNDA:s huvudmeny. Har du några frågor eller funderingar är du välkommen att höra av dig till forskarlaget via e-post (stunda@mau.se) eller per telefon (Alexander Engström, 040-66 58622; Karl Kronkvist 040-66 58215). Forskningens huvudman är Malmö universitet (Malmö universitet, 205 06 Malmö, telefon 040-665 70 10, e-post info@mau.se).
                    </Text>
                </View>

                {this.renderDoneButton()}
            </View>
        )
    }

    renderType = type => {
        switch (type) {
            case "terms":
                return this.renderTerms()
            case "consent":
                return this.renderConsent()
            case "done":
                return this.renderDone()
            default:
                return null
        }
    }

    render() {
        const type = this.props.navigation.getParam("type", "terms")

        return (
            <View style={{ flex: 1 }}>
                <ScrollView
                    style={s.scroll}
                    contentContainerStyle={{ paddingVertical: 25 }}>
                    {this.renderType(type)}
                </ScrollView>
            </View>
        )
    }
}

// Styles
// ======
const s = StyleSheet.create({
    bulletContainer: {
        alignItems: "flex-start",
        marginTop: 12,
        marginBottom: 8
    },
    bullet: {
        fontSize: WIDTH <= 320 ? 14 : 16,
        fontWeight: "bold",
        color: "#111",
        fontFamily: FONT
    },
    textContainer: {
        marginTop: 5,
        marginBottom: 12
    },
    text: {
        fontSize: WIDTH <= 320 ? 13 : 14,
        fontFamily: FONT,
        color: "#222",
        lineHeight: 18
    },
    scroll: {
        flex: 1,
        paddingHorizontal: WIDTH <= 320 ? 15 : 25 
    },
    actions: {
        flexDirection: "row",
        height: 48,
        justifyContent: "center",
        backgroundColor: "#f7f7f7",
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: "rgba(0, 0, 0, 0.3)" 
    },
    tosContainer: {
        marginLeft: 10,
        marginBottom: 2 
    },
    tosText: {
        fontFamily: FONT,
        fontSize: WIDTH <= 320 ? 10 : 12
    },
    icon: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center" 
    },
    buttonLeftContainer: {
        flex: 1,
        alignItems: "flex-start",
        justifyContent: "center" 
    },
    buttonRightContainer: {
        flex: 1,
        maxWidth: 80,
        alignItems: "flex-end",
        justifyContent: "center" 
    },
    buttonContainer: {
        flex: 1,
        alignItems: "flex-end",
        justifyContent: "center" 
    },
    loading: {
        marginVertical: 30,
        alignItems: "center",
        justifyContent: "center"
    },
    button: {
        marginVertical: 30,
        alignItems: "center",
        justifyContent: "center"
    },
    buttonText: {
        fontFamily: FONT,
        fontSize: WIDTH <= 320 ? 14 : 16,
        color: "#0e7afe"
    },
    boldItalic: {
        fontWeight: "bold",
        fontStyle: "italic"
    },
    step: {
        paddingLeft: 15,
        alignItems: "center"
    },
    stepTxt: {
        fontFamily: FONT,
        fontSize: WIDTH <= 320 ? 14 : 16,
    }
})

// Export
// ======
export default connect(
    state => ({
        tos: state.user.tos,
        startSurvey: state.user.startSurvey,
        surveys: state.surveys.data
    }),
    dispatch => ({
        acceptTerms: done => {
            dispatch(acceptTerms(done))
        },
        setCurrentSurvey: t => {
            dispatch(setCurrentSurvey(t))
        }
    })
)(TermsScreen)
