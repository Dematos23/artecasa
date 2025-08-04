"use client";
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AdminContactsPage;
var table_1 = require("@/components/ui/table");
var card_1 = require("@/components/ui/card");
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var badge_1 = require("@/components/ui/badge");
var react_1 = require("react");
var ContactForm_1 = require("./ContactForm");
var contacts_1 = require("@/services/contacts");
var use_toast_1 = require("@/hooks/use-toast");
var AuthContext_1 = require("@/context/AuthContext");
var alert_dialog_1 = require("@/components/ui/alert-dialog");
var page_1 = require("./[id]/page");
var getFullName = function (contact) {
    return [contact.firstname, contact.secondname, contact.firstlastname, contact.secondlastname].filter(Boolean).join(' ');
};
function AdminContactsPage() {
    var _this = this;
    var _a = (0, react_1.useState)([]), contacts = _a[0], setContacts = _a[1];
    var _b = (0, AuthContext_1.useAuth)(), user = _b.user, authLoading = _b.loading;
    var _c = (0, react_1.useState)(false), isFormOpen = _c[0], setIsFormOpen = _c[1];
    var _d = (0, react_1.useState)(undefined), selectedContact = _d[0], setSelectedContact = _d[1];
    var _e = (0, react_1.useState)(true), loading = _e[0], setLoading = _e[1];
    var _f = (0, react_1.useState)(null), viewingContactId = _f[0], setViewingContactId = _f[1];
    var toast = (0, use_toast_1.useToast)().toast;
    var _g = (0, react_1.useState)(false), isAlertOpen = _g[0], setIsAlertOpen = _g[1];
    var _h = (0, react_1.useState)(null), contactToDelete = _h[0], setContactToDelete = _h[1];
    var fetchContacts = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var contactsData, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    return [4 /*yield*/, (0, contacts_1.getContacts)()];
                case 1:
                    contactsData = _a.sent();
                    setContacts(contactsData);
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _a.sent();
                    console.error(error_1);
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: "No se pudieron cargar los contactos.",
                    });
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [toast]);
    (0, react_1.useEffect)(function () {
        if (!authLoading && user) {
            fetchContacts();
        }
        else if (!authLoading && !user) {
            setLoading(false);
            console.log("User not authenticated. Cannot fetch contacts.");
        }
    }, [authLoading, user, fetchContacts]);
    var handleSave = function (contactData) { return __awaiter(_this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    if (!selectedContact) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, contacts_1.updateContact)(selectedContact.id, contactData)];
                case 1:
                    _a.sent();
                    toast({
                        title: "Éxito",
                        description: "El contacto se ha actualizado correctamente.",
                    });
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, (0, contacts_1.addContact)(contactData)];
                case 3:
                    _a.sent();
                    toast({
                        title: "Éxito",
                        description: "El contacto se ha creado correctamente.",
                    });
                    _a.label = 4;
                case 4: return [4 /*yield*/, fetchContacts()];
                case 5:
                    _a.sent(); // Refetch data
                    setIsFormOpen(false);
                    setSelectedContact(undefined);
                    return [3 /*break*/, 7];
                case 6:
                    error_2 = _a.sent();
                    console.error("Error guardando contacto: ", error_2);
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: "No se pudo guardar el contacto.",
                    });
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var openFormForEdit = function (contact) {
        setSelectedContact(contact);
        setIsFormOpen(true);
    };
    var openFormForCreate = function () {
        setSelectedContact(undefined);
        setIsFormOpen(true);
    };
    var handleDeleteClick = function (id) {
        setContactToDelete(id);
        setIsAlertOpen(true);
    };
    var confirmDelete = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!contactToDelete) return [3 /*break*/, 6];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, (0, contacts_1.deleteContact)(contactToDelete)];
                case 2:
                    _a.sent();
                    toast({
                        title: "Éxito",
                        description: "El contacto se ha eliminado correctamente.",
                    });
                    return [4 /*yield*/, fetchContacts()];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 4:
                    error_3 = _a.sent();
                    console.error("Error deleting contact: ", error_3);
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: "No se pudo eliminar el contacto.",
                    });
                    return [3 /*break*/, 6];
                case 5:
                    setIsAlertOpen(false);
                    setContactToDelete(null);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var handleViewDetails = function (id) {
        setViewingContactId(id);
    };
    var handleCloseDetails = function () {
        setViewingContactId(null);
    };
    return (<>
      <alert_dialog_1.AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <alert_dialog_1.AlertDialogContent>
          <alert_dialog_1.AlertDialogHeader>
            <alert_dialog_1.AlertDialogTitle>¿Estás absolutamente seguro?</alert_dialog_1.AlertDialogTitle>
            <alert_dialog_1.AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente
              el contacto de la base de datos.
            </alert_dialog_1.AlertDialogDescription>
          </alert_dialog_1.AlertDialogHeader>
          <alert_dialog_1.AlertDialogFooter>
            <alert_dialog_1.AlertDialogCancel onClick={function () { return setContactToDelete(null); }}>Cancelar</alert_dialog_1.AlertDialogCancel>
            <alert_dialog_1.AlertDialogAction onClick={confirmDelete}>Continuar</alert_dialog_1.AlertDialogAction>
          </alert_dialog_1.AlertDialogFooter>
        </alert_dialog_1.AlertDialogContent>
      </alert_dialog_1.AlertDialog>
      <ContactForm_1.ContactForm isOpen={isFormOpen} onClose={function () { return setIsFormOpen(false); }} onSave={handleSave} contact={selectedContact}/>

      {viewingContactId ? (<page_1.default contactId={viewingContactId} onCloseDetails={handleCloseDetails}/>) : (<>
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
            <h1 className="text-2xl font-bold font-headline">Formularios de Contacto</h1>
            <p className="text-muted-foreground">Ver y gestionar las consultas de clientes potenciales.</p>
        </div>
        <button_1.Button onClick={openFormForCreate} className="w-full sm:w-auto">
            <lucide_react_1.PlusCircle className="mr-2 h-4 w-4"/> Crear Contacto
        </button_1.Button>
      </div>

       {loading ? (<p>Cargando contactos...</p>) : (<>
          {/* Mobile View - Cards */}
          <div className="md:hidden space-y-4">
              {contacts.map(function (contact) { return (<card_1.Card key={contact.id}>
                <card_1.CardHeader>
                  <card_1.CardTitle className="text-base truncate">
                    <span className="font-bold cursor-pointer" onClick={function () { return handleViewDetails(contact.id); }}>{getFullName(contact)}</span>
                  </card_1.CardTitle>
                  <card_1.CardDescription>{contact.email}</card_1.CardDescription>
                </card_1.CardHeader>
                <card_1.CardContent className="flex justify-between items-center">
                    <div className="flex gap-1 flex-wrap">
                      {contact.types.map(function (type) { return (<badge_1.Badge key={type} variant="secondary" className="capitalize">{type}</badge_1.Badge>); })}
                    </div>
                  <dropdown_menu_1.DropdownMenu>
                    <dropdown_menu_1.DropdownMenuTrigger asChild>
                      <button_1.Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menú</span>
                        <lucide_react_1.MoreHorizontal className="h-4 w-4"/>
                      </button_1.Button>
                    </dropdown_menu_1.DropdownMenuTrigger>
                    <dropdown_menu_1.DropdownMenuContent align="end">
                      <dropdown_menu_1.DropdownMenuItem onClick={function () { return openFormForEdit(contact); }}>Editar</dropdown_menu_1.DropdownMenuItem>
                      <dropdown_menu_1.DropdownMenuItem onClick={function () { return handleDeleteClick(contact.id); }} className="text-destructive">Eliminar</dropdown_menu_1.DropdownMenuItem>
                    </dropdown_menu_1.DropdownMenuContent>
                  </dropdown_menu_1.DropdownMenu>
                </card_1.CardContent>
              </card_1.Card>); })}
          </div>

          {/* Desktop View - Table */}
          <div className="hidden md:block overflow-x-auto">
            <table_1.Table>
              <table_1.TableHeader>
                <table_1.TableRow>
                  <table_1.TableHead>Nombre</table_1.TableHead>
                  <table_1.TableHead>Correo Electrónico</table_1.TableHead>
                  <table_1.TableHead>Teléfono</table_1.TableHead>
                  <table_1.TableHead>Tipo</table_1.TableHead>
                  <table_1.TableHead>Acciones</table_1.TableHead>
                </table_1.TableRow>
              </table_1.TableHeader>
              <table_1.TableBody>
                {contacts.map(function (contact) { return (<table_1.TableRow key={contact.id}>
                    <table_1.TableCell className="font-medium">
                       <span className="font-bold cursor-pointer" onClick={function () { return handleViewDetails(contact.id); }}>{getFullName(contact)}</span>
                    </table_1.TableCell>
                    <table_1.TableCell>{contact.email}</table_1.TableCell>
                    <table_1.TableCell>{contact.phone || '-'}</table_1.TableCell>
                    <table_1.TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {contact.types.map(function (type) { return (<badge_1.Badge key={type} variant="secondary" className="capitalize">{type}</badge_1.Badge>); })}
                      </div>
                    </table_1.TableCell>
                    <table_1.TableCell>
                      <dropdown_menu_1.DropdownMenu>
                        <dropdown_menu_1.DropdownMenuTrigger asChild>
                          <button_1.Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <lucide_react_1.MoreHorizontal className="h-4 w-4"/>
                          </button_1.Button>
                        </dropdown_menu_1.DropdownMenuTrigger>
                        <dropdown_menu_1.DropdownMenuContent align="end">
                          <dropdown_menu_1.DropdownMenuItem onClick={function () { return openFormForEdit(contact); }}>Editar</dropdown_menu_1.DropdownMenuItem>
                          <dropdown_menu_1.DropdownMenuItem onClick={function () { return handleDeleteClick(contact.id); }} className="text-destructive">Eliminar</dropdown_menu_1.DropdownMenuItem>
                        </dropdown_menu_1.DropdownMenuContent>
                      </dropdown_menu_1.DropdownMenu>
                    </table_1.TableCell>
                  </table_1.TableRow>); })}
              </table_1.TableBody>
            </table_1.Table>
          </div>
        </>)}
      )}
    </>)};
}
    </>);
}
